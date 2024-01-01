const dateHelper = (data) => {
    let dateObj = new Date(data)
    console.log(dateObj.toString())
    let formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
    return formattedDate
}
module.exports = {
    dateHelper,
}
