const UserModal = require('../mongo-schema/user.schema');

const userResolver = {
    getUsers: async () => {
        return await UserModal.find();
    },
    getUser: async ({ id }) => {
        return await UserModal.findById(id);
    },
    createUser: async ({ userInput }) => {
        const user = await UserModal.create(userInput);
        return user;
    },
};

module.exports = userResolver;
