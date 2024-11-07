const Role = require("../models/Role");

exports.createRole = async (req, res) => {
  const { name } = req.body;

  try {
    // Verificar si el rol ya existe
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: "El rol ya existe" });
    }

    // Crear el nuevo rol
    const role = new Role({ name });
    await role.save();

    res.status(201).json({ message: "Rol creado exitosamente", role });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el rol", error });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo los roles", error });
  }
};
