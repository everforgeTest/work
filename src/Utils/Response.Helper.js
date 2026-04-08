module.exports = {
  success: (data) => ({ success: data }),
  error: (code, message, details = null) => ({ error: { code, message, details } })
};
