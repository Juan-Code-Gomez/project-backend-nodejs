const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  identification: { type: String, required: true, unique: true }, // Cédula o documento
  email: { type: String }, // Opcional
  phone: { type: String }, // Opcional
  address: { type: String }, // Opcional
  birthDate: { type: Date }, // Fecha de nacimiento
  age: { type: Number }, // Edad
  bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], required: true }, // Grupo Sanguíneo
  maritalStatus: { type: String, enum: ["Soltero", "Casado", "Divorciado", "Viudo", "Unión Libre"] }, // Estado civil
  department: { type: String }, // Departamento
  city: { type: String }, // Ciudad
  photo: { type: String }, // URL o path de la imagen
  observations: { type: String }, // Observaciones generales
  personalHistory: { type: String }, // Antecedentes personales
  familyHistory: { type: String }, // Antecedentes familiares
  allergies: { type: String }, // Alergias
  vaccines: { type: String }, // Vacunas
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Patient", patientSchema);