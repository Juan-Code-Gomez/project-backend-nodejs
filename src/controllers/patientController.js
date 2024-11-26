const Patient = require("../models/Patient");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Crear un paciente
exports.addPatient = async (req, res) => {
  const {
    firstName,
    lastName,
    identification,
    email,
    phone,
    address,
    birthDate,
    age,
    bloodGroup,
    maritalStatus,
    department,
    city,
    photo,
    observations,
    personalHistory,
    familyHistory,
    allergies,
    vaccines,
  } = req.body;

  try {
    // Validar si ya existe un paciente con el mismo número de identificación
    const existingPatient = await Patient.findOne({ identification });
    if (existingPatient) {
      return res.status(400).json({ message: "El paciente ya existe." });
    }

    // Crear el paciente
    const newPatient = new Patient({
      firstName,
      lastName,
      identification,
      email,
      phone,
      address,
      birthDate,
      age,
      bloodGroup,
      maritalStatus,
      department,
      city,
      photo,
      observations,
      personalHistory,
      familyHistory,
      allergies,
      vaccines,
    });

    await newPatient.save();
    res.status(201).json({
      message: "Paciente agregado exitosamente.",
      patient: newPatient,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar el paciente.", error });
  }
};

// Obtener lista de pacientes

exports.getPatients = async (req, res) => {
  const { identification, firstName, lastName, gender } = req.query;

  try {
    // Crear un objeto dinámico para los filtros
    const filters = {};
    if (identification) filters.identification = identification;
    if (firstName) filters.firstName = { $regex: firstName, $options: "i" }; // Búsqueda insensible a mayúsculas
    if (lastName) filters.lastName = { $regex: lastName, $options: "i" };
    if (gender) filters.gender = gender;

    // Buscar pacientes con los filtros
    const patients = await Patient.find(filters);
    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los pacientes.", error });
  }
};

// Exportar la lista de pacientes en excel
exports.exportPatientsToExcel = async (req, res) => {
  try {
    const patients = await Patient.find(); // Obtener todos los pacientes

    // Transformar los datos a un formato adecuado para Excel
    const data = patients.map((patient) => ({
      Nombre: `${patient.firstName} ${patient.lastName}`,
      Identificación: patient.identification,
      Email: patient.email || "",
      Teléfono: patient.phone || "",
      Dirección: patient.address || "",
      "Fecha de Nacimiento": patient.birthDate
        ? patient.birthDate.toISOString().split("T")[0]
        : "",
      Género: patient.gender,
      "Fecha de Registro": patient.createdAt.toISOString().split("T")[0],
    }));

    // Crear un libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes");

    // Guardar el archivo temporalmente
    const filePath = path.join(__dirname, "../exports", "Pacientes.xlsx");
    XLSX.writeFile(workbook, filePath);

    // Enviar el archivo al cliente
    res.download(filePath, "Pacientes.xlsx", (err) => {
      if (err) {
        console.error(err);
      }

      // Eliminar el archivo temporal después de enviarlo
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al exportar los pacientes.", error });
  }
};
