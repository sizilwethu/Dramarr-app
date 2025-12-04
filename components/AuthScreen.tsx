
import React, { useState } from 'react';
import { Mail, Lock, User, Calendar, MapPin, ArrowRight, Users } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email?: string, password?: string, isSignUp?: boolean, username?: string, additionalData?: any) => void;
}

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "East Timor (Timor-Leste)", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Personal Info Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = () => {
      const additionalData = !isLogin ? { firstName, lastName, gender, dob, country } : undefined;
      onLogin(email, password, !isLogin, username, additionalData);
  };

  return (
    <div className="h-full w-full bg-black relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-pink/20 rounded-full blur-[100px]" />

      <div className="z-10 w-full max-w-md h-full flex flex-col justify-center overflow-y-auto no-scrollbar">
        <div className="text-center mb-8 shrink-0 pt-10">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink mb-2 tracking-tighter">dramarr</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">Your Daily Dose of Drama</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl shrink-0 mb-10">
          <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
            <button 
              className={`flex-1 pb-2 text-sm font-bold transition-all ${isLogin ? 'text-white border-b-2 border-neon-purple' : 'text-gray-500'}`}
              onClick={() => setIsLogin(true)}
            >
              LOGIN
            </button>
            <button 
              className={`flex-1 pb-2 text-sm font-bold transition-all ${!isLogin ? 'text-white border-b-2 border-neon-pink' : 'text-gray-500'}`}
              onClick={() => setIsLogin(false)}
            >
              SIGN UP
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                   <div className="relative">
                     <User className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
                     <input 
                        type="text" 
                        placeholder="Name" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-3 pl-9 pr-2 text-sm text-white focus:border-neon-pink focus:outline-none transition-colors" 
                     />
                   </div>
                   <div className="relative">
                     <User className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
                     <input 
                        type="text" 
                        placeholder="Surname" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-3 pl-9 pr-2 text-sm text-white focus:border-neon-pink focus:outline-none transition-colors" 
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="relative">
                     <Users className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
                     <input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-3 pl-9 pr-2 text-sm text-white focus:border-neon-pink focus:outline-none transition-colors" 
                     />
                   </div>
                   <div className="relative">
                     <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-3 px-3 text-sm text-gray-400 focus:text-white focus:border-neon-pink focus:outline-none appearance-none"
                     >
                        <option value="" disabled>Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                     </select>
                   </div>
                </div>
              </>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:outline-none transition-colors" 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:outline-none transition-colors" 
              />
            </div>

            {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Date of Birth" 
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            onFocus={(e) => e.target.type = 'date'}
                            onBlur={(e) => e.target.type = 'text'}
                            className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-3 pl-9 pr-2 text-sm text-white focus:border-neon-pink focus:outline-none" 
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
                        <select 
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-3 pl-9 pr-2 text-sm text-gray-400 focus:text-white focus:border-neon-pink focus:outline-none appearance-none"
                        >
                            <option value="" disabled>Country</option>
                            {COUNTRIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <button 
              onClick={handleSubmit}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${isLogin ? 'bg-gradient-to-r from-neon-purple to-purple-800' : 'bg-gradient-to-r from-neon-pink to-pink-800'}`}
            >
              {isLogin ? 'ENTER DRAMARR' : 'CREATE ACCOUNT'} <ArrowRight size={18} />
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs mb-4">Or continue with</p>
            <div className="flex justify-center gap-4">
               <button className="w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center hover:scale-110 transition-transform">G</button>
               <button className="w-10 h-10 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center hover:scale-110 transition-transform">f</button>
               <button className="w-10 h-10 rounded-full bg-gray-800 text-white font-bold flex items-center justify-center hover:scale-110 transition-transform"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
