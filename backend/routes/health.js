const registerHealthRoutes = (app) => {
    app.get("/health", async () => {
        return { ok: true };
    });
};

module.exports = { registerHealthRoutes };

