const isUserExists = () => {
    return !!localStorage.getItem("echo");
};

function getRelativeTime(dateString) {
    const inputDate = new Date(dateString); // Parse the input date
    const currentDate = new Date(); // Get the current date and time

    // Calculate the difference in time (in milliseconds)
    const timeDifference = currentDate - inputDate;

    // Convert the difference to days
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    // Return the appropriate label based on the day difference
    if (dayDifference === 0) {
        return "Today";
    } else if (dayDifference === 1) {
        return "1 day ago";
    } else if (dayDifference > 1) {
        return `${dayDifference} days ago`;
    } else if (dayDifference === -1) {
        return "Tomorrow";
    } else if (dayDifference < -1) {
        return `In ${Math.abs(dayDifference)} days`;
    }
}

export { isUserExists, getRelativeTime };