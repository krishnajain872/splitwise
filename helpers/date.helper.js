const dateHelper = (date) => {
    let formattedDate
    if (date === null || !date) {
        formattedDate = null
    } else {
        let dateObj = new Date(date)
        formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    }

    return formattedDate
}
module.exports = {
    dateHelper,
}
