const users = [
  {
    name: "Admin",
    email: "admin@vectramail.com",
    password: "123456",
    rol: "admin",
  },
];

const system_settings = [
  {
    key: "maintenance_mode",
    value: "false",
  },
  {
    key: "no_register_mode",
    value: "false",
  },
  {
    key: "confidence_threshold",
    value: "0.5",
  },
  {
    key: "smoothing_factor",
    value: "0.5",
  },
  {
    key: "retention_days",
    value: "30",
  },
];

export { users, system_settings };
