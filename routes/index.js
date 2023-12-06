const fs = require('fs')
const path = require('path')

const routesFolder = path.resolve('./routes')

const getAllRoutesPath = function () {
    const allRoutesPath = []

    fs.readdirSync(routesFolder).forEach((file) => {
        const fullPath = `${routesFolder}/${file}`
        if (fs.existsSync(fullPath) && fullPath.endsWith('.route.js')) {
            allRoutesPath.push({
                fileName: file.replace('.route.js', ''),
                fullPath: fullPath.replace('.js', ''),
            })
        }
    })
    return allRoutesPath
}

const registerRoutes = function (app) {
    const allRoutesPath = getAllRoutesPath()
    for (const routeFile of allRoutesPath) {
        const router = require(routeFile.fullPath)
        app.use(`/api/${routeFile.fileName}`, router)
    }
}

module.exports = {
    registerRoutes,
}
