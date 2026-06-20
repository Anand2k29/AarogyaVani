import React from 'react';
import { DecodedPrescriptionResult } from '../services/prescriptionDecoder';

interface ScannerContentProps {
  appState: 'IDLE' | 'DETECTING' | 'SUCCESS' | 'ERROR';
  previewUrl: string | null;
  s: any;
  t: (key: string) => string;
  scanLang: string;
  setScanLang: (lang: string) => void;
  isLangOpen: boolean;
  setIsLangOpen: (val: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  result: DecodedPrescriptionResult | null;
  isPlaying: boolean;
  toggleAudio: () => void;
  reset: () => void;
  confirmAddMedicine: (name: string, dosageFull: string) => void;
  errorMsg: string | null;
  isDesktop: boolean;
  isDark: boolean;
  isAnchor: boolean;
}

export const ScannerContent: React.FC<ScannerContentProps> = ({
  appState, previewUrl, s, t, scanLang, setScanLang, isLangOpen, setIsLangOpen,
  fileInputRef, handleFileSelect, result, isPlaying, toggleAudio, reset,
  confirmAddMedicine, errorMsg, isDesktop, isDark, isAnchor
}) => {
  const Icon = ({ d, filled = false }: { d: string | string[]; filled?: boolean }) => (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
  const CamIcon = () => <Icon d={['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', 'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z']} />;
  const ChevIcon = () => <Icon d="M6 9l6 6 6-6" />;
  const StopIcon = () => <Icon d="M8 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" filled />;
  const WarnIcon = () => <Icon d={['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01']} />;
  const Spinner = () => (
    <div style={{ width: 48, height: 48, border: '4px solid rgba(232,84,122,0.2)', borderTopColor: '#E8547A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {appState === 'IDLE' && (
        <>
          <div style={{ textAlign: 'center', paddingTop: isDesktop ? 0 : 8 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, background: 'rgba(232,84,122,0.10)', border: `1px solid rgba(232,84,122,0.25)`, color: s.accent, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.accent, display: 'inline-block' }} />
              AI Voice Companion
            </div>
            <h1 style={{ fontSize: isDesktop ? 44 : 34, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: s.txtPri, margin: '0 0 12px' }}>
              {t('app_name').slice(0, 8)}<br /><span style={{ color: s.accent }}>{t('scanner')}</span>
            </h1>
            <p style={{ fontSize: 16, color: s.txtSec, margin: 0, lineHeight: 1.5 }}>
              {t('scan_btn')}
            </p>
          </div>

          <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20, position: 'relative', zIndex: 10 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.txtMuted, marginBottom: 10 }}>Translate Output To</label>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              style={{ width: '100%', background: s.subtle, border: `1px solid ${isLangOpen ? s.accent : s.border}`, borderRadius: 14, padding: '16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', outline: 'none', transition: 'all 0.2s', boxShadow: isLangOpen ? '0 0 0 2px rgba(232,84,122,0.2)' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>🌍</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: s.txtPri }}>
                  {{en:'English',hi:'Hindi',kn:'Kannada',te:'Telugu',ta:'Tamil',mr:'Marathi',bn:'Bengali',gu:'Gujarati',ml:'Malayalam'}[scanLang] || 'English'}
                </span>
              </div>
              <div style={{ width: 20, height: 20, color: s.txtMuted, transform: isLangOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <ChevIcon />
              </div>
            </button>
            {isLangOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setIsLangOpen(false)} />
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#FFF5F8', border: `1px solid ${s.border}`, borderRadius: 16, padding: '8px', zIndex: 10, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', maxHeight: 300, overflowY: 'auto' }}>
                  {[
                    { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }, { code: 'kn', name: 'Kannada' },
                    { code: 'te', name: 'Telugu' }, { code: 'ta', name: 'Tamil' }, { code: 'mr', name: 'Marathi' },
                    { code: 'bn', name: 'Bengali' }, { code: 'gu', name: 'Gujarati' }, { code: 'ml', name: 'Malayalam' }
                  ].map(l => (
                    <button key={l.code}
                      onClick={() => { setScanLang(l.code); setIsLangOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none', background: scanLang === l.code ? 'rgba(232,84,122,0.1)' : 'transparent', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.1s' }}
                    >
                      <span style={{ fontSize: 16, fontWeight: scanLang === l.code ? 800 : 500, color: scanLang === l.code ? s.accent : s.txtPri }}>{l.name}</span>
                      {scanLang === l.code && <span style={{ marginLeft: 'auto', color: s.accent, fontSize: 14 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button onClick={() => fileInputRef.current?.click()}
            style={{ background: s.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer', width: '100%', boxShadow: '0 8px 32px rgba(232,84,122,0.3)', transition: 'all 0.2s' }}
          >
            <div style={{ width: 56, height: 56, background: 'rgba(0,0,0,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28 }}><CamIcon /></div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>{t('take_photo')}</div>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7, marginTop: 4 }}>{t('sc_upload_label')}</div>
            </div>
          </button>
          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />

          <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.txtMuted, margin: '0 0 12px' }}>Tips for Best Results</p>
            {['Good lighting on the prescription', 'Keep it flat and unfolded', 'Ensure text is clearly visible'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 2 ? 10 : 0 }}>
                <div style={{ width: 24, height: 24, background: `${s.accent}22`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: s.accent, fontSize: 12, fontWeight: 700 }}>✓</span>
                </div>
                <span style={{ fontSize: 15, color: s.txtSec }}>{tip}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {appState === 'DETECTING' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, paddingTop: 24 }}>
          {previewUrl && (
            <div style={{ position: 'relative', width: '100%', borderRadius: 24, overflow: 'hidden', border: `1px solid ${s.border}`, maxHeight: 340 }}>
              <img src={previewUrl} alt="Prescription" style={{ width: '100%', height: 340, objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
              <div className="scan-line" />
            </div>
          )}
          <div style={{ textAlign: 'center', margin: '40px 0' }}>
            <Spinner />
            <p style={{ fontSize: 13, color: s.txtMuted, margin: 0, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
              Translating to {{en:'English',hi:'Hindi',kn:'Kannada',te:'Telugu',ta:'Tamil',mr:'Marathi',bn:'Bengali',gu:'Gujarati',ml:'Malayalam'}[scanLang] || 'English'}
            </p>
          </div>
        </div>
      )}

      {appState === 'SUCCESS' && result && (
        <div style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: isDesktop ? '0 0 340px' : 'unset', display: 'flex', flexDirection: 'column', gap: 14, ...(isDesktop ? { position: 'sticky', top: 96 } : {}) }}>
            {previewUrl && (
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1px solid ${s.border}` }}>
                <img src={previewUrl} alt="Prescription" style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#1db954' }}>Decoded</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                      {{en:'English',hi:'Hindi'}[scanLang] || 'English'}
                    </p>
                  </div>
                  {result.provider && <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 50, color: '#fff', fontWeight: 700 }}>via {result.provider}</span>}
                </div>
              </div>
            )}
            <button onClick={toggleAudio}
              style={{ background: isPlaying ? s.red : s.accent, color: isPlaying ? '#fff' : '#000', border: 'none', borderRadius: 50, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', cursor: 'pointer', fontSize: 17, fontWeight: 800, boxShadow: isPlaying ? '0 6px 24px rgba(229,57,53,0.3)' : '0 6px 24px rgba(29,185,84,0.3)', transition: 'all 0.2s' }}
            >
              {isPlaying ? (<><div style={{ width: 20, height: 20 }}><StopIcon /></div> Stop Audio</>) : (
                <><div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 20 }}>
                  {[14, 20, 16, 12].map((h, i) => <div key={i} className="wave-bar" style={{ height: h }} />)}
                </div> Speak Instructions</>
              )}
            </button>
            <button onClick={reset}
              style={{ background: 'transparent', border: `1px solid ${s.border}`, color: s.txtSec, borderRadius: 50, padding: '14px 24px', width: '100%', cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.2s' }}
            >
              ↩ Scan New
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {result.rawSummary && (
              <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 18, padding: 18, borderLeft: `4px solid ${s.accent}` }}>
                <p style={{ margin: 0, fontSize: 15, color: s.txtSec, lineHeight: 1.6, fontStyle: 'italic' }}>"{result.rawSummary}"</p>
              </div>
            )}
            {result.items.length > 0 ? result.items.map((item, idx) => (
              <div key={idx} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 4, background: s.accent, borderRadius: 2, alignSelf: 'stretch', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: s.accent }}>Medicine {idx + 1}</p>
                    <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: s.txtPri }}>{item.medicineName}</h2>
                    <p style={{ margin: 0, fontSize: 14, color: s.txtMuted, fontStyle: 'italic' }}>{item.usedFor}</p>
                  </div>
                </div>
                <div style={{ background: isDark ? 'rgba(29,185,84,0.1)' : 'rgba(29,185,84,0.06)', border: '1px solid rgba(29,185,84,0.2)', borderRadius: 14, padding: 16 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: s.accent }}>Instructions</p>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: s.txtPri, lineHeight: 1.5 }}>{item.translatedDosage}</p>
                </div>
                {item.warning && (
                  <div style={{ background: isDark ? 'rgba(229,57,53,0.1)' : 'rgba(229,57,53,0.06)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 18, height: 18, color: s.red, flexShrink: 0, marginTop: 1 }}><WarnIcon /></div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: isDark ? '#ff7b7b' : '#c62828' }}>{item.warning}</p>
                  </div>
                )}
                {!isAnchor && (
                  <button onClick={() => confirmAddMedicine(item.medicineName, item.translatedDosage)}
                    style={{ background: 'rgba(29,185,84,0.1)', color: s.accent, border: '1px solid rgba(29,185,84,0.2)', borderRadius: 50, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 800, width: '100%', transition: 'all 0.2s' }}
                  >
                    💊 {t('add_to_meds')}
                  </button>
                )}
              </div>
            )) : (
              <div style={{ textAlign: 'center', background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 40 }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: s.txtMuted, margin: '0 0 8px' }}>No medicines found</p>
                <p style={{ fontSize: 14, color: s.txtMuted, margin: 0 }}>Try a clearer photo with better lighting.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {appState === 'ERROR' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 24 }}>
          <div style={{ width: 80, height: 80, background: 'rgba(229,57,53,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(229,57,53,0.2)' }}>
            <div style={{ width: 36, height: 36, color: s.red }}><WarnIcon /></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: s.txtPri }}>{t('sc_error')}</p>
            <p style={{ margin: 0, fontSize: 15, color: s.txtMuted, lineHeight: 1.5 }}>{errorMsg}</p>
          </div>
          <button onClick={reset} style={{ background: s.accent, color: '#000', border: 'none', borderRadius: 50, padding: '18px 40px', cursor: 'pointer', fontSize: 17, fontWeight: 800, width: '100%' }}>{t('auth_sign_in_btn') === 'Sign In' ? 'Try Again' : t('sc_error')}</button>
        </div>
      )}
    </div>
  );
};
