function setRequestedData(jsonData) {
    let impactData = [];
    let requestedData = jsonData.data;
    for (let n = 0; n < requestedData.length; n++) {
        //Get Date & Time
        let date = requestedData[n][0].split(" ")[0];
        let time = requestedData[n][0].split(" ")[1];

        //Get Energy
        let energy = requestedData[n][1];

        //Get Impact Energy
        let impact_energy = requestedData[n][2];

        //Get Latitude
        let lat = requestedData[n][3];
        let latdir = requestedData[n][4];
        if (latdir == "S") lat *= -1;

        //Get Longitude
        let lng = requestedData[n][5];
        let lngdir = requestedData[n][6];
        if (lngdir == "W") lng *= -1;

        //Get Altitude
        let alt = requestedData[n][7];

        //Get velocity
        let vel = requestedData[n][8];
        //Set color and size
        let color = "";
        let size = Math.log(1.05 + energy / 500);
        if (energy > 300) {
            color = "#ff0000";
        } else if (energy > 150) {
            color = "#ff751a";
        } else if (energy > 75) {
            color = "#ffd11a";
        } else if (energy > 37.5) {
            color = "#ffff4d";
        } else if (energy > 18.25) {
            color = "#ffffb3";
        } else if (energy > 9.125) {
            color = "#ffffff";
        } else if (energy > 4.5625) {
            color = "#b3e6ff";
        } else if (energy > 2.28125) {
            color = "#3399ff";
        } else {
            color = "#1111ff";
        }

        //Create entry
        let entry = {
            date: date,
            time: time,
            impact_energy: impact_energy,
            energy: energy,
            lat: lat,
            lng: lng,
            size: size,
            color: color,
            alt: alt,
            vel: vel,
        };

        //Push entry
        impactData.push(entry);
    }
    return impactData;
}