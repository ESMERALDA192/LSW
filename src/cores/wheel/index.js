const CONTRACT_SIZE_DEFAULT = 100;

class WheelInputError extends Error {
  constructor(message, details = []) {
    super(message);
    this.status = 400;
    this.code = 'WHEEL_VALIDATION_ERROR';
    this.details = details;
  }
}

module.exports = { WheelInputError, CONTRACT_SIZE_DEFAULT };
