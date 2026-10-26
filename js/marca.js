/* ============================================================
   ASESORIA-HACIENDA-FLANDES · MARCA
   Lo único que se toca al mover el backend o Firebase.

   API_URL   backend HACIENDA (Apps Script, cuenta alcaldia.digital).
   RTDB      base de tiempo real de semaforo-hacienda: el nodo
             asesorias/publico trae los cupos libres SIN datos personales
             (lo escribe solo el backend; la web lo lee directo).
   FIREBASE / GEMINI  configuración web PÚBLICA (Firebase AI Logic para
             "Ordenar mi texto", con App Check reCAPTCHA Enterprise). La
             llave de Gemini está restringida a botheart911.github.io y
             solo a Firebase AI Logic y App Check.
   ============================================================ */
(function (raiz) {
  'use strict';
  raiz.MARCA = {
    APP: 'ASESORIA-HACIENDA',
    TITULO: 'Asesoría telefónica',
    ENTIDAD: 'Secretaría de Hacienda',
    MUNICIPIO: 'Alcaldía de Flandes · Tolima',
    API_URL: 'https://script.google.com/macros/s/AKfycby_TJ_vPiqPJdJdqBMuhya_Prwb7UMoFEUMISeHv_nAqT0jepMDfu5kNBn5ayTKiuJB_A/exec',
    RTDB: 'https://semaforo-hacienda-default-rtdb.firebaseio.com',
    NODO_CUPOS: 'asesorias/publico',
    FIREBASE: {
      authDomain: 'semaforo-hacienda.firebaseapp.com',
      projectId: 'semaforo-hacienda',
      storageBucket: 'semaforo-hacienda.firebasestorage.app',
      messagingSenderId: '372729856735',
      appId: '1:372729856735:web:abddede02bcc431c07df6a'
    },
    GEMINI: {
      apiKey: 'AIzaSyB_unWKXQCZyP2WFzpWce60fYPsI6e8bGg',
      siteKey: '6LdkU_8tAAAAAFtGdObFc45EtbEDXjRQNHUcsnka',
      modelo: 'gemini-3.1-flash-lite',
      topeDia: 8
    },
    STORAGE_NS: 'asehac.'
  };
})(window);
