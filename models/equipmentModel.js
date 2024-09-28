const fs = require('fs');
const path = require('path');

const equipmentDataPath = path.join(__dirname, '../data/equipment.json');

exports.getAllEquipment = () => {
    const equipment = JSON.parse(fs.readFileSync(equipmentDataPath, 'utf8'));
    return equipment;
};

exports.saveEquipment = (equipment) => {
    fs.writeFileSync(equipmentDataPath, JSON.stringify(equipment, null, 2));
};
