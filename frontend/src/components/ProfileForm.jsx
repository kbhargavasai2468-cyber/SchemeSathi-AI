import React, { useState } from 'react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry'
];

const OCCUPATIONS = [
  'Student',
  'Farmer',
  'Self-Employed / Small Business',
  'Daily Wage Worker',
  'Unemployed / Job Seeker',
  'Private Sector Employee',
  'Government Employee',
  'Homemaker',
  'Other'
];

const EDUCATION_LEVELS = [
  'Below 10th Standard',
  '10th Pass (Matriculation)',
  '12th Pass (Higher Secondary)',
  'Diploma / ITI',
  'Graduate (B.A / B.Sc / B.Com / B.Tech)',
  'Post Graduate / Higher',
  'No Formal Education'
];

export const ProfileForm = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    age: '22',
    gender: 'male',
    state: 'Andhra Pradesh',
    occupation: 'Student',
    annualIncome: '250000',
    education: 'Graduate (B.A / B.Sc / B.Com / B.Tech)',
    hasBankAccount: true,
    hasLpg: true,
    ownsPuccaHouse: false,
    isFarmer: false
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const ageNum = parseInt(formData.age, 10);
    const incomeNum = parseInt(formData.annualIncome, 10);

    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setValidationError('Please enter a valid age between 1 and 120.');
      return;
    }

    if (isNaN(incomeNum) || incomeNum < 0) {
      setValidationError('Please enter a valid annual family income.');
      return;
    }

    if (!formData.state) {
      setValidationError('Please select your state.');
      return;
    }

    const payload = {
      age: ageNum,
      gender: formData.gender,
      state: formData.state,
      occupation: formData.occupation.toLowerCase().includes('student') ? 'student' : formData.occupation,
      annualIncome: incomeNum,
      education: formData.education.includes('B.Tech') ? 'B.Tech' : formData.education,
      hasBankAccount: Boolean(formData.hasBankAccount),
      hasLpg: Boolean(formData.hasLpg),
      ownsPuccaHouse: Boolean(formData.ownsPuccaHouse),
      isFarmer: Boolean(formData.isFarmer)
    };

    onSubmit(payload);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Tell Us About You</h2>
        <p className="form-subtitle">
          Please answer the questions below. Your information is used solely to match eligible government schemes.
        </p>
      </div>

      {validationError && (
        <div className="form-error-alert">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Age */}
          <div className="form-group">
            <label className="form-label" htmlFor="age">Age (in years) *</label>
            <input
              id="age"
              type="number"
              className="form-input"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="e.g. 22"
              min="1"
              max="120"
              required
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <div className="radio-group">
              <label className={`radio-card ${formData.gender === 'male' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === 'male'}
                  onChange={() => handleChange('gender', 'male')}
                />
                Male
              </label>
              <label className={`radio-card ${formData.gender === 'female' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === 'female'}
                  onChange={() => handleChange('gender', 'female')}
                />
                Female
              </label>
              <label className={`radio-card ${formData.gender === 'other' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === 'other'}
                  onChange={() => handleChange('gender', 'other')}
                />
                Other
              </label>
            </div>
          </div>

          {/* State */}
          <div className="form-group">
            <label className="form-label" htmlFor="state">State / Union Territory *</label>
            <select
              id="state"
              className="form-select"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              required
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Occupation */}
          <div className="form-group">
            <label className="form-label" htmlFor="occupation">Current Occupation *</label>
            <select
              id="occupation"
              className="form-select"
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              required
            >
              {OCCUPATIONS.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          {/* Annual Family Income */}
          <div className="form-group">
            <label className="form-label" htmlFor="annualIncome">Total Annual Family Income (₹) *</label>
            <span className="form-label-desc">Approximate yearly income of your entire household</span>
            <input
              id="annualIncome"
              type="number"
              className="form-input"
              value={formData.annualIncome}
              onChange={(e) => handleChange('annualIncome', e.target.value)}
              placeholder="e.g. 250000"
              min="0"
              step="5000"
              required
            />
          </div>

          {/* Education */}
          <div className="form-group">
            <label className="form-label" htmlFor="education">Highest Education Completed *</label>
            <select
              id="education"
              className="form-select"
              value={formData.education}
              onChange={(e) => handleChange('education', e.target.value)}
              required
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Are you a Farmer? */}
          <div className="form-group">
            <label className="form-label">Are you or your family a landholding farmer? *</label>
            <div className="radio-group">
              <label className={`radio-card ${formData.isFarmer === true ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="isFarmer"
                  checked={formData.isFarmer === true}
                  onChange={() => handleChange('isFarmer', true)}
                />
                Yes
              </label>
              <label className={`radio-card ${formData.isFarmer === false ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="isFarmer"
                  checked={formData.isFarmer === false}
                  onChange={() => handleChange('isFarmer', false)}
                />
                No
              </label>
            </div>
          </div>

          {/* Owns Pucca House? */}
          <div className="form-group">
            <label className="form-label">Do you or your family own a pucca (permanent) house? *</label>
            <div className="radio-group">
              <label className={`radio-card ${formData.ownsPuccaHouse === true ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="ownsPuccaHouse"
                  checked={formData.ownsPuccaHouse === true}
                  onChange={() => handleChange('ownsPuccaHouse', true)}
                />
                Yes
              </label>
              <label className={`radio-card ${formData.ownsPuccaHouse === false ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="ownsPuccaHouse"
                  checked={formData.ownsPuccaHouse === false}
                  onChange={() => handleChange('ownsPuccaHouse', false)}
                />
                No
              </label>
            </div>
          </div>

          {/* Has LPG Connection? */}
          <div className="form-group">
            <label className="form-label">Does your household have an active LPG gas connection? *</label>
            <div className="radio-group">
              <label className={`radio-card ${formData.hasLpg === true ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="hasLpg"
                  checked={formData.hasLpg === true}
                  onChange={() => handleChange('hasLpg', true)}
                />
                Yes
              </label>
              <label className={`radio-card ${formData.hasLpg === false ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="hasLpg"
                  checked={formData.hasLpg === false}
                  onChange={() => handleChange('hasLpg', false)}
                />
                No
              </label>
            </div>
          </div>

          {/* Has Bank Account? */}
          <div className="form-group">
            <label className="form-label">Do you currently have a bank savings account? *</label>
            <div className="radio-group">
              <label className={`radio-card ${formData.hasBankAccount === true ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="hasBankAccount"
                  checked={formData.hasBankAccount === true}
                  onChange={() => handleChange('hasBankAccount', true)}
                />
                Yes
              </label>
              <label className={`radio-card ${formData.hasBankAccount === false ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="hasBankAccount"
                  checked={formData.hasBankAccount === false}
                  onChange={() => handleChange('hasBankAccount', false)}
                />
                No
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            ← Back
          </button>
          <button type="submit" className="btn-primary">
            Find My Schemes →
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
