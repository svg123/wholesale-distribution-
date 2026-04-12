import api from './api';

const barcodeService = {
  generate: (orderId) => api.post(`/barcode/generate/${orderId}`),

  getByOrder: (orderId) => api.get(`/barcode/order/${orderId}`),

  print: (barcodeId) => api.post(`/barcode/${barcodeId}/print`),

  download: (barcodeId, format = 'png') =>
    api.get(`/barcode/${barcodeId}/download`, {
      params: { format },
      responseType: 'blob',
    }),
};

export default barcodeService;
