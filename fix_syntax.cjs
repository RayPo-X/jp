const fs = require('fs');
const file = 'd:/jp/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const errorBlock = `                  )}
                </div>
             </div>
                  ) : (
                      <button onClick={handleScanObsidian} disabled={isScanningObsidian} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                        {isScanningObsidian ? '掃描中...' : (obsidianDirHandle ? '🔄 重新掃描 Obsidian 資料夾' : '📁 授權並掃描 Obsidian 資料夾')}
                      </button>
                  )}
                </div>
             </div>`;

const correctBlock = `                  )}
                </div>
             </div>`;

content = content.replace(errorBlock, correctBlock);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error');
