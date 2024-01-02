const { dateHelper } = require('../helpers/date.helper')

const createGroup = async (_, res, next) => {
    let recievedData = res.data.group.dataValues || {}
    let resultData = {}
    let members = []
    if (recievedData) {
        resultData.group = {
            id: recievedData.id,
            title: recievedData.title,
            displayPicture: recievedData.display_picture,
            adminId: recievedData.admin_id,
            category: recievedData.category,
            createdAt: dateHelper(recievedData.created_at),
        }

        recievedData.member.map((member) => {
            members.push({
                id: member.id,
                firstName: member.firstName,
                email: member.email,
                mobile: member.mobile,
            })
        })
        resultData.members = members
    }
    res.data = resultData
    next()
}

const findGroups = async (_, res, next) => {
    let recievedData = res.data.dataValues || {}
    let resultData = {}
    // let group = []

    if (recievedData) {
        resultData.group = {
            id: recievedData.id,
            title: recievedData.title,
            displayPicture: recievedData.display_picture,
            adminId: recievedData.admin_id,
            category: recievedData.category,
            createdAt: dateHelper(recievedData.created_at),
        }
        recievedData.map(() => {
            groups.push({
                id: member.id,
                firstName: member.firstName,
                email: member.email,
                mobile: member.mobile,
            })
        })
        resultData.members = members
    }
    res.data = resultData
    next()
}
module.exports = {
    createGroup,
    findGroups,
}
