  // function transformPrescription(prescription) {
  //   // if (!rawData.success || !rawData.prescription) {
  //   //   throw new Error("Invalid data format");
  //   // }
  
  //   // const prescription = rawData.prescription;
  
  //   return {
  //     prescription_id: prescription.prescription_id,
  //     patient_id: prescription.patient_id,
  //     doctor_id: prescription.doctor_id,
  //     instructions: prescription.instructions,
  //     created_at: prescription.created_at,
  //     expiry_date: prescription.expiry_date,
  //     MEDICATIONs: prescription.MEDICATIONs.map(med => ({
  //       medication_id: med.medication_id,
  //       name: med.name,
  //       dosage: med.dosage,
  //       frequency: med.frequency,
  //       duration: med.duration,
  //       prescription_id: med.prescription_id
  //     })),
  //     Doctor: {
  //       id: String(prescription.Doctor.doctor_id),
  //       name: `${prescription.Doctor.user.first_name} ${prescription.Doctor.user.last_name}`,
  //       specialty: {
  //         id: String(prescription.Doctor.SPECIALTY.specialty_id),
  //         name: prescription.Doctor.SPECIALTY.name
  //       },
  //       hospital: prescription.Doctor.clinique_name,
  //       rating: parseFloat(prescription.Doctor.rating),
  //       reviewCount: parseInt(prescription.Doctor.reviewCount),
  //       imageResId: null,
  //       imageUrl: null, // You can populate this if you store doctor image URLs
  //       about: prescription.Doctor.about,
  //       yearsExperience: prescription.Doctor.yearsExperience,
  //       hospitalLocation: prescription.Doctor.location,
  //       patients: prescription.Doctor.patiens,
  //       workingHours: "Not provided" // Add from API if available
  //     },
  //     Patient: {
  //       patient_id: prescription.Patient.patient_id,
  //       fullName: `${prescription.Patient.user.first_name} ${prescription.Patient.user.last_name}`,
  //       date_birthday: prescription.Patient.date_birthday,
  //       sexe: prescription.Patient.sexe,
  //       user_id: prescription.Patient.user.user_id
  //     }
  //   };
  // }

  function transformPrescription(prescription) {
    if (!prescription) {
      throw new Error("Prescription not found");
    }
    
    // Transformer l'objet appointment si présent
    let appointmentData = null;
    console.log("prescription.Appointment", prescription.Appointment);
    console.log("prescription.Appointment.appointment_id", prescription.Appointment.APPOINTMENT_SLOT);
    console.log("prescription.Appointment.DOCTOR_SCHEDUL", prescription.Appointment.APPOINTMENT_SLOT.DOCTOR_SCHEDULE);
    if (prescription.Appointment) {
      appointmentData = {
        id: String(prescription.Appointment.appointment_id),
        patientId: String(prescription.Appointment.patient_id),
        doctorId: String(prescription.Appointment.APPOINTMENT_SLOT?.DOCTOR_SCHEDULE?.doctor_id || ""),
        date: prescription.Appointment.APPOINTMENT_SLOT?.working_date || "",
        time: prescription.Appointment.APPOINTMENT_SLOT?.start_time || "",
        status: prescription.Appointment.status || "PENDING",
        reason: prescription.Appointment.reason || ""
      };
    }
    
    return {
      
        prescription_id: prescription.prescription_id,
        patient_id: prescription.patient_id,
        doctor_id: prescription.doctor_id,
        instructions: prescription.instructions,
        appointment_id: prescription.appointment_id || null,
        created_at: prescription.created_at.toISOString(),
        expiry_date: prescription.expiry_date.toISOString(),
        MEDICATIONs: prescription.MEDICATIONs.map(med => ({
          medication_id: med.medication_id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          prescription_id: med.prescription_id
        })),
        Doctor: {
          id: prescription.Doctor.doctor_id,
          name: `${prescription.Doctor.user.first_name} ${prescription.Doctor.user.last_name}`,
          specialty: {
            specialty_id: prescription.Doctor.SPECIALTY.specialty_id,
            name: prescription.Doctor.SPECIALTY.name
          },
          clinique_name: prescription.Doctor.clinique_name,
          rating: parseFloat(prescription.Doctor.rating || 0),
          reviewCount: parseInt(prescription.Doctor.reviewCount || 0),
          about: prescription.Doctor.about || "",
          yearsExperience: prescription.Doctor.yearsExperience || 0,
          hospital: prescription.Doctor.location || "",
          patiens: prescription.Doctor.patiens || 0
        },
        Patient: {
          patient_id: prescription.Patient.patient_id,
          user_id: prescription.Patient.user.user_id,
          fullName: `${prescription.Patient.user.first_name} ${prescription.Patient.user.last_name}`,
          date_birthday: prescription.Patient.date_birthday,
          sexe: prescription.Patient.sexe
        },
        Appointment: prescription.Appointment
      }
    };
  
  

module.exports = transformPrescription;
