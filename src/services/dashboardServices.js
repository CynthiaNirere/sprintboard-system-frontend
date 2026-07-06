import api from './services';

export default {
 getStats() {
   return api.get('dashboard/stats')},
getReport() {
  return api.get('dashboard/report');
},
};
