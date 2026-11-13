export function createAuthController({ registerUser, loginUser }) {
  return {
    async register(req, res) {
      const user = await registerUser(req.body);
      res.status(201).json(user);
    },

    async login(req, res) {
      res.json(await loginUser(req.body));
    },

    me(req, res) {
      res.json(req.user);
    },
  };
}
