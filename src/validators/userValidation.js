const User = require('../models/User');

// Función para validar el registro del usuario
const validateUserRegistration = async ({ username, email, role, firstName, lastName }) => {
  
  if (!username || !email || !role || !firstName || !lastName) {
    return "Todos los campos son obligatorios (login, email, rol, nombre, apellido).";
  }

  // Verificar si el correo ya existe
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return "Este email ya está registrado.";
  }

  // Verificar si el nombre de usuario ya existe
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return "Este nombre de usuario ya está registrado.";
  }

  return null; // No hay errores de validación
};

module.exports = { validateUserRegistration };
