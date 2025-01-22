const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const approveInstituteSchema = new mongoose.Schema({
  instituteName: { type: String, required: true },
  numberOfStudents: { type: String, required: true }, // Ensure this is a String
  region: { type: String, required: true },
  instituteAdminName: { type: String, required: true },
  instituteAdminEmail: { type: String, required: true },
  institutePhoneNumber: { type: String, required: true },
  domainName: { type: String, required: true },
  status: { type: String, default: 'active' }
}, { timestamps: true });

approveInstituteSchema.plugin(AutoIncrement, { inc_field: 'instituteId' });

module.exports = mongoose.model('RegisteredInstitutes', approveInstituteSchema);

