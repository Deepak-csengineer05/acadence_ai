import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * ClaySelect — Claymorphism-style custom dropdown.
 *
 * Props:
 *   value      — currently selected value
 *   onChange   — function(value) called when user picks an option
 *   options    — array of { value, label } OR plain <option> children (auto-parsed)
 *   placeholder — text shown when nothing selected (string)
 *   icon       — optional lucide icon element prepended inside the trigger
 *   required   — native required attribute forwarded to hidden input
 *   name       — native name for form submission
 *   className  — extra class for the wrapper
 *   disabled   — disables the picker
 */
function ClaySelect({
  value,
  onChange,
  options: optionsProp,
  children,
  placeholder = 'Select an option',
  icon,
  required,
  name,
  className = '',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Parse options from either prop or <option> children
  const options = React.useMemo(() => {
    if (optionsProp) return optionsProp;
    if (!children) return [];
    return React.Children.toArray(children)
      .filter(c => c.type === 'option')
      .map(c => ({
        value: c.props.value,
        label: c.props.children,
        disabled: c.props.disabled,
      }));
  }, [optionsProp, children]);

  const selected = options.find(o => String(o.value) === String(value));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={`clay-select-wrapper ${open ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`}
    >
      {/* Hidden native input for form submission */}
      {name && <input type="hidden" name={name} value={value ?? ''} required={required} />}

      {/* Trigger button */}
      <button
        type="button"
        className="clay-select-trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        {icon && <span className="clay-select-icon">{icon}</span>}
        <span className={`clay-select-value ${!selected ? 'placeholder' : ''}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="clay-select-chevron" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="clay-select-panel" role="listbox">
          <div className="clay-select-inner">
            {options.map((opt, i) => (
              <div
                key={`${opt.value}-${i}`}
                role="option"
                aria-selected={String(opt.value) === String(value)}
                className={`clay-select-option
                  ${String(opt.value) === String(value) ? 'active' : ''}
                  ${opt.disabled ? 'disabled' : ''}
                `}
                onClick={() => handleSelect(opt)}
              >
                <span className="clay-option-label">{opt.label}</span>
                {String(opt.value) === String(value) && (
                  <Check size={14} className="clay-option-check" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClaySelect;
