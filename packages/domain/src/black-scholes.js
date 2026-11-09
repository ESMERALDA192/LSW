// FIC: European Black-Scholes-Merton option valuation without dividends.
// FIC: Valoración de opciones europeas Black-Scholes-Merton sin dividendos.

/**
 * Aproximación racional de Cody (1969) para la función de error (erf/erfc).
 * Proporciona una precisión de punto flotante de 64 bits (~1e-15).
 * Referencia: Cody, W. J. (1969). "Rational Chebyshev Approximations for the Error Function".
 * @param {number} x
 * @returns {number}
 */
export function codyErf(x) {
  if (Number.isNaN(x)) return NaN;
  if (x === -Infinity) return -1;
  if (x === Infinity) return 1;

  const XBREAK = 0.46875;
  const SQRPI = 0.56418958354775628694807945156;

  const P1 = [
    3.209377589138469472562e3,
    3.774852376853020211135e2,
    1.138641541510501556495e2,
    3.16112374387056560e0,
    1.85777706184603153e-1
  ];
  const Q1 = [
    2.844236833439170624273e3,
    1.282616526077372275645e3,
    2.440246379344441733056e2,
    2.360129095234412093499e1,
    1.0
  ];

  const P2 = [
    1.23033935479799725272e3,
    2.05107551348260022442e3,
    1.71204761268164769149e3,
    4.38313496549666010420e2,
    5.40772069473860013808e1,
    3.94051089000632931872e0,
    1.35008540131241030585e-1
  ];
  const Q2 = [
    1.23033935480374942040e3,
    2.74474846857198030324e3,
    2.22666880443281156916e3,
    7.81614999017953177309e2,
    1.60942981667864010381e2,
    1.96212726366965164551e1,
    1.0
  ];

  const P3 = [
    -6.58749161529837803157e-4,
    -1.60837851487455009897e-2,
    -1.25781726111229246204e-1,
    -3.60340818785589081216e-1,
    -3.05326634961232344035e-1,
    -1.63153871373020978498e-2
  ];
  const Q3 = [
    2.33520497626869185443e-3,
    6.05183416343586818247e-2,
    5.27905102951428412234e-1,
    1.87295284992346047209e0,
    2.56852019228982242072e0,
    1.0
  ];

  const y = Math.abs(x);
  if (y <= XBREAK) {
    const ysq = y * y;
    let xnum = P1[4] * ysq;
    let xden = Q1[4] * ysq;
    for (let i = 3; i >= 1; i--) {
      xnum = (xnum + P1[i]) * ysq;
      xden = (xden + Q1[i]) * ysq;
    }
    const result = x * ((xnum + P1[0]) / (xden + Q1[0]));
    return result;
  }

  if (y <= 4.0) {
    let xnum = P2[6] * y;
    let xden = Q2[6] * y;
    for (let i = 5; i >= 1; i--) {
      xnum = (xnum + P2[i]) * y;
      xden = (xden + Q2[i]) * y;
    }
    const res = Math.exp(-y * y) * ((xnum + P2[0]) / (xden + Q2[0]));
    return x < 0 ? res - 1.0 : 1.0 - res;
  }

  if (y < 26.543) {
    const ysq = 1.0 / (y * y);
    let xnum = P3[5] * ysq;
    let xden = Q3[5] * ysq;
    for (let i = 4; i >= 1; i--) {
      xnum = (xnum + P3[i]) * ysq;
      xden = (xden + Q3[i]) * ysq;
    }
    let res = ysq * ((xnum + P3[0]) / (xden + Q3[0]));
    res = (SQRPI - res) / y;
    res = Math.exp(-y * y) * res;
    return x < 0 ? res - 1.0 : 1.0 - res;
  }

  return x < 0 ? -1.0 : 1.0;
}

/**
 * Función de Distribución Acumulada (CDF) de la distribución Normal Estándar N(0, 1).
 * @param {number} x
 * @returns {number}
 */
export function standardNormalCdf(x) {
  if (Number.isNaN(x)) return NaN;
  if (x === -Infinity) return 0;
  if (x === Infinity) return 1;
  return 0.5 * (1.0 + codyErf(x / Math.SQRT2));
}

/**
 * Función de Densidad de Probabilidad (PDF) de la distribución Normal Estándar N(0, 1).
 * @param {number} x
 * @returns {number}
 */
export function standardNormalPdf(x) {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

/**
 * Calcula precios teóricos de opciones Call y Put europeas bajo Black-Scholes-Merton.
 * @param {{ spot: number, strike: number, time_years: number, rate: number, volatility: number }} inputs
 * @returns {{ model: string, call_price: number, put_price: number, d1?: number, d2?: number }}
 */
export function calculateBlackScholes(inputs) {
  const { spot, strike, time_years, rate, volatility } = inputs;

  // Manejo de vencimiento inmediato T = 0 (valor intrínseco sin división por cero)
  if (time_years === 0) {
    const callPrice = Math.max(spot - strike, 0);
    const putPrice = Math.max(strike - spot, 0);
    return {
      model: 'black_scholes_merton',
      call_price: callPrice,
      put_price: putPrice
    };
  }

  const sqrtT = Math.sqrt(time_years);
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * volatility * volatility) * time_years) / (volatility * sqrtT);
  const d2 = d1 - volatility * sqrtT;

  const cdfD1 = standardNormalCdf(d1);
  const cdfD2 = standardNormalCdf(d2);
  const cdfNegD1 = standardNormalCdf(-d1);
  const cdfNegD2 = standardNormalCdf(-d2);

  const discount = Math.exp(-rate * time_years);

  const callPrice = spot * cdfD1 - strike * discount * cdfD2;
  const putPrice = strike * discount * cdfNegD2 - spot * cdfNegD1;

  if (!Number.isFinite(callPrice) || !Number.isFinite(putPrice)) {
    const rangeError = new Error('Los valores calculados exceden el rango numérico representable.');
    rangeError.code = 'NUMERIC_RANGE_ERROR';
    throw rangeError;
  }

  return {
    model: 'black_scholes_merton',
    call_price: callPrice,
    put_price: putPrice,
    d1,
    d2
  };
}

