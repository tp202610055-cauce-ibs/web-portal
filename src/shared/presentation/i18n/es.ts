// Single catalog of visible texts (es-PE, informal "tú"); components never hardcode copy.
export const es = {
  app: {
    name: 'Cauce',
    portal: 'Portal del nutricionista',
  },
  generic: {
    error: 'Algo salió mal. Inténtalo de nuevo.',
    field: 'Revisa este campo',
    loading: 'Cargando…',
  },
  nav: {
    label: 'Navegación principal',
    patients: 'Panel de pacientes',
    management: 'Gestión de pacientes',
  },
  management: {
    title: 'Gestión de pacientes',
    intro:
      'Genera un código de invitación y compártelo con tu paciente para vincularlo a tu cuenta.',
    goToManagement: 'Ir a Gestión de pacientes',
  },
  invitations: {
    generate: 'Generar código de invitación',
    generating: 'Generando…',
    codeLabel: 'Código de invitación',
    expires: (date: string, time: string, hours: number) =>
      `Vence el ${date} a las ${time} (en ${hours} horas).`,
    copy: 'Copiar',
    copied: 'Código copiado',
    copyFailed: 'No se pudo copiar. Selecciona el código y cópialo.',
    refused: {
      pending_activation: 'Tu cuenta todavía no está activada y no puede generar códigos.',
      inactive: 'Tu cuenta está inactiva y no puede generar códigos.',
      suspended: 'Tu cuenta está suspendida y no puede generar códigos.',
      unavailable: 'Tu cuenta no puede generar códigos en este momento.',
    },
  },
  session: {
    signedInAs: 'Sesión de',
    logout: 'Cerrar sesión',
    unavailable: 'No pudimos conectar con el portal.',
    retry: 'Reintentar',
    idleClosed: 'Tu sesión se cerró por inactividad. Inicia sesión de nuevo.',
    expired: 'Tu sesión terminó. Inicia sesión de nuevo.',
  },
  login: {
    title: 'Ingresa al portal',
    email: 'Correo electrónico',
    password: 'Contraseña',
    submit: 'Ingresar',
    submitting: 'Ingresando…',
    rejected: 'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.',
    lockedToday: (time: string) =>
      `Tu cuenta está bloqueada temporalmente. Inténtalo de nuevo después de las ${time}.`,
    lockedOnDate: (date: string, time: string) =>
      `Tu cuenta está bloqueada temporalmente. Inténtalo de nuevo después del ${date} a las ${time}.`,
    rateLimited: 'Hiciste demasiados intentos. Espera un momento e inténtalo de nuevo.',
  },
  idle: {
    title: '¿Sigues ahí?',
    body: (remaining: string) => `Por inactividad, tu sesión se cerrará en ${remaining}.`,
    announcement: (remaining: string) => `Tu sesión se cerrará en ${remaining}.`,
    stay: 'Seguir conectado',
    logout: 'Cerrar sesión',
  },
  patients: {
    title: 'Panel de pacientes',
    tableCaption: 'Pacientes asignados, en el orden de prioridad que define el sistema',
    columns: {
      name: 'Paciente',
      subtype: 'Subtipo',
      score: 'IBS-SSS',
      lastActivity: 'Última actividad',
      priority: 'Prioridad',
      overdueReviews: 'Revisiones de más de 24 h',
      profile: 'Perfil',
    },
    nameUnavailable: 'Nombre no disponible',
    noSubtype: 'Sin subtipo',
    noScore: 'Sin evaluación',
    noActivity: 'Sin actividad registrada',
    profilePending: 'Perfil pendiente',
    profileComplete: 'Completo',
    empty: 'Aún no tienes pacientes asignados.',
    emptyHint:
      'Para recibir pacientes, genera un código de invitación en Gestión de pacientes y compártelo con tu paciente.',
    loadError: 'No fue posible cargar el panel en este momento.',
    retry: 'Reintentar',
  },
  subtype: {
    IbsD: 'SII-D',
    IbsC: 'SII-C',
    IbsM: 'SII-M',
    IbsU: 'SII-NC',
  },
  priority: {
    High: 'Alta',
    Medium: 'Media',
    Low: 'Normal',
    None: 'Normal',
  },
  notFound: {
    title: 'Página no encontrada',
    back: 'Volver al inicio',
  },
} as const;
