const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const badChunk = `              </div>
            </div>
v>
              </div>
            </div>
            
            {/* Two Column Layout */}`;

const goodChunk = `              </div>
            </div>
            {/* Two Column Layout */}`;

code = code.split(badChunk).join(goodChunk);
fs.writeFileSync('src/App.jsx', code);
