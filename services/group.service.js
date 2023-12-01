const db = require("../models");
const User = db.User;
const Group = db.Group;

const createGroup = async (payload) => {
  const existingUser = await User.findByPk(payload.admin_id);
  if (!existingUser) {
    const error = new Error("user not found");
    error.statusCode = 404;
    throw error;
  }
  if (existingUser.status === "dummy" || existingUser.status === "invited") {
    const error = new Error("user is not verified");
    error.statusCode = 403;
    throw error;
  }
  const group = await Group.create(payload);
  return group.dataValues;
};

const deleteGroup = async (payload) => {
  const existingGroup = await Group.findByPk(payload.group_id);
  if (!existingGroup) {
    const error = new Error("group not found");
    error.statusCode = 404;
    throw error;
  }

  // it also check if all the user debts are settle up or not if not that cannot delete group
  // check code remaining
  const existingAdmin = await User.findByPk(payload.admin_id);
  if (!existingAdmin) {
    const error = new Error("admin not found");
    error.statusCode = 404;
    throw error;
  }
  if (existingGroup.admin_id === existingAdmin.id) {
    await Group.destroy({
      where: { id: payload.group_id },
    });
    return existingGroup;
  } else {
    const error = new Error("unAuthorized Access");
    error.statusCode = 403;
    throw error;
  }
};

const updateGroup = async (payload) => {
  const existingGroup = await Group.findByPk(payload.group_id);
  if (!existingGroup) {
    const error = new Error("group not found");
    error.statusCode = 404;
    throw error;
  }
  const existingAdmin = await User.findByPk(payload.admin_id);
  if (!existingAdmin) {
    const error = new Error("admin not found");
    error.statusCode = 404;
    throw error;
  }
  if (existingGroup.admin_id === existingAdmin.id) {
    await Group.update(
      { ...existingGroup, ...payload },
      {
        where: {
          id: existingGroup.id,
        },
      },
    );
    return existingGroup;
  } else {
    const error = new Error("unAuthorized Access");
    error.statusCode = 403;
    throw error;
  }
};
const updateGroupAdmin = async (payload) => {
  const existingGroup = await Group.findByPk(payload.group_id);
  if (!existingGroup) {
    const error = new Error("group not found");
    error.statusCode = 404;
    throw error;
  }
  const existingAdmin = await User.findByPk(payload.admin_id);
  if (!existingAdmin) {
    const error = new Error("admin not found");
    error.statusCode = 404;
    throw error;
  }
  const existingUser = await User.findByPk(payload.user_id);
  if (!existingUser) {
    const error = new Error("user not found");
    error.statusCode = 404;
    throw error;
  }
  if (existingGroup.admin_id === existingAdmin.id) {
    await Group.update(
      { ...existingGroup, admin_id: payload.user_id },
      {
        where: {
          id: existingGroup.id,
        },
      },
    );
    return existingGroup;
  } else {
    const error = new Error("unAuthorized Access");
    error.statusCode = 403;
    throw error;
  }
};

// filters
const findGroupById = async (payload) => {
  const existingGroup = await Group.findByPk(payload.group_id);
  if (!existingGroup) {
    const error = new Error("group not found");
    error.statusCode = 404;
    throw error;
  }

  return existingGroup.dataValues;
};

// findGroupByName
// findGroupByCategory
// findGroupByAdminId

module.exports = {
  createGroup,
  deleteGroup,
  updateGroup,
  updateGroupAdmin,
  findGroupById,
};
