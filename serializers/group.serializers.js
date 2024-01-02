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

const addMembers = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    let members = []
    let groupDetails = {}
    let addedBy = {}
    if (recievedData) {
        recievedData.members.map((member, i) => {
            members.push({
                [`member${++i}`]: {
                    id: member.user_details.id,
                    firstName: member.user_details.first_name,
                    email: member.user_details.email,
                    mobile: member.user_details.mobile,
                },
            })

            groupDetails = {
                title: member.group_details.dataValues.title,
                category: member.group_details.dataValues.category,
                id: member.group_details.dataValues.id,
                adminId: member.group_details.admin_id,
            }
        })
        addedBy.firstName = recievedData.added_by.first_name
        addedBy.LastName = recievedData.added_by.last_name
        addedBy.status = recievedData.added_by.status
        addedBy.email = recievedData.added_by.email
        addedBy.id = recievedData.added_by.id
        addedBy.mobile = recievedData.added_by.mobile

        resultData.members = members
        resultData.groupDetails = groupDetails
        resultData.addedBy = addedBy
    }
    res.data = resultData
    next()
}

const findGroupMembers = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    let members = []
    let groupDetails = {}
    if (recievedData) {
        console.log(recievedData)
        groupDetails = {
            title: recievedData.title,
            category: recievedData.category,
            id: recievedData.id,
            adminId: recievedData.admin_id,
        }
        recievedData.members.map((member, i) => {
            members.push({
                [`member${++i}`]: {
                    id: member.user_details.id,
                    firstName: member.user_details.first_name,
                    email: member.user_details.email,
                    mobile: member.user_details.mobile,
                },
            })
        })
        resultData.groupDetails = groupDetails
        resultData.members = members
    }
    res.data = resultData
    next()
}

const findGroups = async (_, res, next) => {
    let recievedData = res.data || {}
    let resultData = {}
    let groups = []
    let totalGroups
    if (recievedData) {
        recievedData.map((group, i) => {
            totalGroups = ++i
            groups.push({
                id: group.id,
                title: group.title,
                displayPicture: group.display_picture,
                adminId: group.admin_id,
                category: group.category,
                createdAt: dateHelper(group.created_at),
            })
        })
        resultData.groups = groups
        resultData.totalGroups = totalGroups
    }
    res.data = resultData
    next()
}
module.exports = {
    createGroup,
    findGroups,
    addMembers,
    findGroupMembers,
}
