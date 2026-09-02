import React, { useState } from 'react';

interface FixturesProps {
  activeFixture: 'none' | 'modal' | 'combobox' | 'contrast';
  stagedAttributes?: Record<string, string>;
  stagedSelector?: string;
}

export const Fixtures: React.FC<FixturesProps> = ({ activeFixture, stagedAttributes = {}, stagedSelector }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState('Select an option');

  // Helper to apply staged attributes to preview changes in real time
  const getDynamicProps = (selector: string) => {
    if (stagedSelector === selector) {
      return stagedAttributes;
    }
    return {};
  };

  return (
    <div id="fixture-container" className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 min-h-[420px] relative">
      {/* FIXTURE 1: Inert Modal Trap */}
      {activeFixture === 'modal' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg">
            <span className="text-slate-200 font-medium">Background Page Content</span>
            <button id="bg-action-btn" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm transition">
              Background Action
            </button>
          </div>

          {isOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
              {/* Broken: missing role="dialog", aria-modal="true", aria-labelledby */}
              <div
                id="modal-box"
                className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 relative"
                {...getDynamicProps('#modal-box')}
              >
                <h3 id="modal-title" className="text-lg font-bold text-white mb-2">Confirm Action</h3>
                <p className="text-slate-300 text-sm mb-6">
                  This modal contains no accessible role attributes, and background elements remain focusable via Tab.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    id="modal-cancel-btn"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    id="modal-confirm-btn"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-sm font-medium"
                  >
                    Delete Item
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FIXTURE 2: Silent Combobox */}
      {activeFixture === 'combobox' && (
        <div className="max-w-xs mx-auto py-12">
          <label className="block text-sm font-medium text-slate-300 mb-2">Assigned Reviewer</label>
          {/* Broken: div clicker without role="combobox", aria-expanded, tabindex="0" */}
          <div
            id="custom-combobox"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 cursor-pointer flex justify-between items-center"
            {...getDynamicProps('#custom-combobox')}
          >
            <span>{selectedItem}</span>
            <span className="text-xs text-slate-500">?</span>
          </div>

          {isOpen && (
            <div id="combobox-options" className="mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
              {['Sarah Drasner', 'Ilya Grigorik', 'Justin Rushing'].map((name) => (
                <div
                  key={name}
                  onClick={() => { setSelectedItem(name); setIsOpen(false); }}
                  className="p-2.5 hover:bg-slate-700 text-sm text-slate-200 cursor-pointer"
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FIXTURE 3: Low-Contrast Grid */}
      {activeFixture === 'contrast' && (
        <div className="grid grid-cols-2 gap-4 py-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Standard Tier</span>
            {/* Broken: #94a3b8 text on white gives ~2.3:1 contrast ratio */}
            <p id="contrast-fail-text" className="text-slate-400 text-sm mt-3" {...getDynamicProps('#contrast-fail-text')}>
              High-frequency metrics analysis with basic trace sampling and uncompressed storage retention.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Enterprise Tier</span>
            <p className="text-slate-700 text-sm mt-3">
              Full live session replays, custom WebMCP tool bridges, and automated accessibility verification suites.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
