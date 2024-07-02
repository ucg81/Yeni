import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [step, setStep] = useState(1);
  const [iin, setIin] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [iinError, setIinError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [countdown, setCountdown] = useState(90);
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [queueId, setQueueId] = useState(1000000);  // Initialize queue ID at 1000000

  useEffect(() => {
    let interval = null;
    if (otpSent && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpSent, countdown]);

  const handleIinChange = (e) => {
    setIin(e.target.value);
  };

  const handleMobileChange = (e) => {
    setMobile(e.target.value);
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleSendSms = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!/^\d{12}$/.test(iin)) {
      setIinError('Please enter a valid 12-digit IIN.');
      valid = false;
    } else {
      setIinError('');
    }

    if (!/^\+?[0-9]{10,14}$/.test(mobile)) {
      setMobileError('Please enter a valid mobile number.');
      valid = false;
    } else {
      setMobileError('');
    }

    if (valid) {
      try {
        const smsResponse = await axios.get(`https://service.sms-consult.kz/get.ashx?login=Orhun_Medical&password=7o5V86xK&id=${queueId}&type=message&recipient=${mobile}&sender=OrhunMed&text=Your verification code is 1234`, {
          timeout: 20000 // Set a timeout of 20 seconds
        });
        if (smsResponse.status === 200) {
          console.log('SMS Response:', smsResponse.data);
          alert('An OTP has been sent to your mobile number. Please check your phone.');
          setStep(2);
          setOtpSent(true);
          setQueueId(prevQueueId => prevQueueId + 1);  // Increment queue ID
        } else {
          console.error('Failed to send SMS. Response status:', smsResponse.status);
          alert('Failed to send SMS. Please try again.');
        }
      } catch (error) {
        console.error('Error sending SMS:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 4 && /^\d+$/.test(otpValue)) {
      try {
        const verifyResponse = await axios.post('http://192.168.10.104:8101/akgunhis/api/verify', {
          token: token,
          otp: otpValue
        }, {
          auth: {
            username: 'IT0001',
            password: '153624.his'
          },
          timeout: 20000 // Set a timeout of 20 seconds
        });

        if (verifyResponse.data.success) {
          console.log('OTP Verification Response:', verifyResponse.data);
          alert('OTP verified successfully. Proceeding to your profile...');
          setStep(3);
          setPatientData(verifyResponse.data.patientData);
        } else {
          console.error('Invalid OTP. Response:', verifyResponse.data);
          setOtpError('Invalid OTP. Please try again.');
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        setOtpError('An error occurred. Please try again.');
      }
    } else {
      setOtpError('Please enter a valid 4-digit OTP.');
    }
  };

  return (
    <div className="App">
      {step === 1 && (
        <div className="container">
          <h1>Send SMS</h1>
          <form onSubmit={handleSendSms}>
            <div className="form-group">
              <label htmlFor="iin">IIN (Individual Identification Number):</label>
              <input
                type="text"
                id="iin"
                name="iin"
                pattern="\d{12}"
                required
                placeholder="Enter 12-digit IIN"
                value={iin}
                onChange={handleIinChange}
              />
              {iinError && <div className="error-message">{iinError}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number:</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                pattern="\+?[0-9]{10,14}"
                required
                placeholder="Enter mobile number"
                value={mobile}
                onChange={handleMobileChange}
              />
              {mobileError && <div className="error-message">{mobileError}</div>}
            </div>
            <button type="submit" className="btn">Send SMS</button>
          </form>
        </div>
      )}
      {step === 2 && (
        <div className="container">
          <h1>Enter OTP</h1>
          <div id="countdown">{countdown}</div>
          <form onSubmit={handleOtpSubmit}>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  className="otp-input"
                  maxLength="1"
                  pattern="\d"
                  required
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                />
              ))}
            </div>
            <button type="submit" className="btn" disabled={countdown <= 0}>Verify OTP</button>
            {otpError && <p className="error-message" id="errorMessage">{otpError}</p>}
          </form>
        </div>
      )}
      {step === 3 && patientData && (
        <div className="container">
          <header>
            <div className="header-content">
              <div className="logo">MediSched</div>
              <div className="user-info">
                <img src="https://medisched.io/avatar.jpg" alt="User Avatar" className="user-avatar" />
                <span className="welcome-message">Welcome, {patientData.name}</span>
              </div>
            </div>
          </header>
          <div className="success-message fade-out">
            Login successful! A cookie has been set for your convenience.
          </div>
          <div className="tabs">
            <div className="tab">Overview</div>
            <div className="tab active">Radiology</div>
            <div className="tab">Laboratory</div>
            <div className="tab">Appointments</div>
          </div>
          <div className="content">
            <h2>Radiology Records</h2>
            {patientData.radiologyRecords.map((record, index) => (
              <div className="record" key={index}>
                <div className="record-date">{record.date}</div>
                <div className="record-type">{record.type}</div>
                <div className="record-details">{record.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
