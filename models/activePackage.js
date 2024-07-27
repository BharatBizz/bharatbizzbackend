const mongoose = require('mongoose');

// ActivePackage Schema
const activePackageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    packageAmount: {
        type: Number,
        required: true
    },
    activatedAt: {
        type: Date,
        default: Date.now
    },
    referredByUserID:{
      type:String,
      required:true  
    }
}, { timestamps: true });

const ActivePackage = mongoose.model("ActivePackage", activePackageSchema);

module.exports = ActivePackage;
