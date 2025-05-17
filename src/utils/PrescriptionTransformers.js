function transformPrescription(prescription) {
  console.log("prescription -->", prescription);
  
  // Extract medication data
  const medications = prescription.MEDICATIONs.map(med => ({
    medication_id: med.dataValues?.medication_id || med.medication_id,
    name: med.dataValues?.name || med.name,
    dosage: med.dataValues?.dosage || med.dosage,
    frequency: med.dataValues?.frequency || med.frequency,
    duration: med.dataValues?.duration || med.duration,
    prescription_id: med.dataValues?.prescription_id || med.prescription_id
  }));
  
  // Extract doctor data
  const doctor = prescription.DOCTOR;
  const doctorUser = doctor.USER.dataValues;
  const specialty = doctor.SPECIALTY.dataValues;
  
  // Extract patient data
  const patient = prescription.PATIENT;
  const patientUser = patient.USER.dataValues;
  
  return {
    prescription_id: prescription.prescription_id,
    patient_id: prescription.patient_id,
    doctor_id: prescription.doctor_id,
    instructions: prescription.instructions,
    created_at: prescription.created_at,
    expiry_date: prescription.expiry_date,
    MEDICATIONs: medications,
    Doctor: {
      id: String(doctor.dataValues.doctor_id),
      name: `${doctorUser.first_name} ${doctorUser.last_name}`,
      specialty: {
        id: String(specialty.specialty_id),
        name: specialty.name
      },
      hospital: doctor.dataValues.clinique_name,
      rating: parseFloat(doctor.dataValues.rating),
      reviewCount: parseInt(doctor.dataValues.reviewCount),
      imageResId: null,
      imageUrl: null,
      about: doctor.dataValues.about,
      yearsExperience: doctor.dataValues.yearsExperience,
      hospitalLocation: doctor.dataValues.location,
      patients: doctor.dataValues.patiens,
      workingHours: "Not provided"
    },
    Patient: {
      patient_id: patient.dataValues.patient_id,
      fullName: `${patientUser.first_name} ${patientUser.last_name}`,
      date_birthday: patient.dataValues.date_birthday,
      sexe: patient.dataValues.sexe,
      user_id: patientUser.user_id
    }
  };
}
  

module.exports = transformPrescription;
