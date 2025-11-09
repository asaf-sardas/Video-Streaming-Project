//check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({
      error: "Unauthorized: You must be logged in to access this resource.",
    });
  }
};

//check if the user is admin
const isAdmin = (req, res, next) => {
  const user = req.session && req.session.user ? req.session.user : null;
  if (!user) {
    return res.status(401).json({
      error: "Unauthorized: You must be logged in to access this resource.",
    });
  }
  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Forbidden: Access denied. Admin permissions required." });
  }
  return next();
};

module.exports = {
  isAuthenticated,
  isAdmin
};
