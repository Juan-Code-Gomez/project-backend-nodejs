const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const { validateUserRegistration } = require("../validators/userValidation");

// Función para generar un código OTP
const generateOtp = () => {
  return crypto.randomBytes(3).toString("hex"); // Genera un código OTP de 6 dígitos en hexadecimal
};

// Registro de usuario
exports.register = async (req, res) => {
  const { username, password, role, email, firstName, lastName } = req.body;

  try {
    // Validaciones
    const validationError = await validateUserRegistration({
      username,
      email,
      role,
      firstName,
      lastName,
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Buscar el ObjectId del rol basado en el nombre (ej: 'admin')
    const userRole = await Role.findOne({ name: role });
    if (!userRole) {
      return res.status(400).json({ error: "Rol no encontrado" });
    }

    const hashedPassword = await user.hashPassword(password);
    user.password = hashedPassword;

    // Crear el nuevo usuario
    const user = new User({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      role: userRole._id, // Usamos el ObjectId del rol encontrado
    });

    await user.save();

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error registrando el usuario" });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar al usuario en la base de datos
    const user = await User.findOne({ username }).populate("role");
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Verificar la contraseña manualmente con bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token JWT si la contraseña es correcta
    const token = jwt.sign(
      { userId: user._id, role: user.role.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      token,
      userRole: user.role.name,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// Función para enviar el correo con el enlace
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Usuario no encontrado" });

    // Generar el OTP
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = otp;
    user.resetPasswordExpires = otpExpires;
    await user.save();

    // Configurar el servicio de email
    const transporter = nodemailer.createTransport({
      service: "gmail", // O tu proveedor de email
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USERNAME,
      subject: "Código de restablecimiento de contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;">
          <div style="text-align: center;">
            <img src="https://res.cloudinary.com/dlcvha12s/image/upload/v1730588492/Captura_de_pantalla_2024-06-18_215735_nr6pnr.png" alt="Logo de la aplicación" style="width: 150px; margin-bottom: 20px;" />
          </div>
          <h2 style="text-align: center; color: #333;">Código de restablecimiento de contraseña</h2>
          <p style="text-align: center; font-size: 16px;">Tu código de restablecimiento de contraseña es:</p>
          <p style="text-align: center; font-size: 24px; color: #2D9CDB; font-weight: bold; margin: 20px 0;">${otp}</p>
          <p style="text-align: center; font-size: 14px; color: #555;">Este código expirará en 10 minutos.</p>
          <hr style="margin: 20px 0;" />
          <p style="text-align: center; font-size: 12px; color: #777;">Si no solicitaste este código, ignora este correo.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Se te ha enviado un codigo al correo" });
  } catch (error) {
    res.status(500).json({
      message: "Error en la solicitud de restablecimiento de contraseña",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el OTP es correcto y no ha expirado
    if (
      user.resetPasswordToken !== otp ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ message: "OTP inválido o expirado" });
    }

    // OTP correcto, permitir el cambio de contraseña
    res
      .status(200)
      .json({ message: "OTP verificado correctamente", email: user.email });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al verificar el OTP" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body; // Cambiar 'token' por 'email'

  try {
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() }, // Verificar que el tiempo de expiración no haya pasado
    });

    if (!user) {
      return res.status(400).json({
        message: "El enlace de restablecimiento es inválido o ha expirado",
      });
    }

    // Encriptar la nueva contraseña antes de guardarla
    user.password = await user.hashPassword(password);

    // Eliminar el token y la fecha de expiración después de usarlo
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Contraseña cambiada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
};
