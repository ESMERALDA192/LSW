import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
const reqRespApi = axios.create({ baseURL: 'https://reqres.in/api', timeout: 12000 });
// Notas 4.9–4.11: Axios + efecto, referencia de página y custom hook.
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const ficRefPage = useRef(1);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    reqRespApi.get('/users', { params: { page }, signal: controller.signal }).then(({ data }) => {
      if (!Array.isArray(data.data)) throw new Error('Formato de respuesta inesperado.');
      setUsuarios(data.data); setTotalPages(data.total_pages || 1); ficRefPage.current = page;
    }).catch(e => { if (!axios.isCancel(e)) setError(e.response?.status === 429 ? 'ReqRes alcanzó el límite de consultas. Intenta más tarde.' : 'No se pudo consultar ReqRes. Revisa tu conexión e intenta de nuevo.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, retry]);
  return { usuarios, page, totalPages, loading, error, previous: () => setPage(p => Math.max(1, p - 1)), next: () => setPage(p => Math.min(totalPages, p + 1)), reload: () => setRetry(n => n + 1) };
}
