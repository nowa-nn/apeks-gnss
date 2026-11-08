export function useFormValidation() {
  function getSubscriberDigits(str) {
    let digits = (str || '').replace(/\D/g, '');
    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.slice(1);
    }
    return digits.slice(0, 10);
  }

  function formatSubscriber(sub) {
    if (!sub) return '';
    let res = '+7 (';
    res += sub.substring(0, 3);
    if (sub.length >= 3) res += ') ' + sub.substring(3, 6);
    if (sub.length >= 6) res += '-' + sub.substring(6, 8);
    if (sub.length >= 8) res += '-' + sub.substring(8, 10);
    return res;
  }

  function countDigitsBefore(str, pos) {
    let count = 0;
    for (let i = 4; i < Math.min(pos, str.length); i++) {
      if (/\d/.test(str[i])) count++;
    }
    return count;
  }

  function getCaretPosAfterDigits(formatted, targetDigitCount) {
    if (targetDigitCount <= 0) return Math.min(4, formatted.length);
    let count = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (i >= 4 && /\d/.test(formatted[i])) {
        count++;
        if (count === targetDigitCount) {
          let nextPos = i + 1;
          while (nextPos < formatted.length && !/\d/.test(formatted[nextPos])) {
            nextPos++;
          }
          return nextPos;
        }
      }
    }
    return formatted.length;
  }

  function setCaret(input, pos) {
    requestAnimationFrame(() => {
      if (input && typeof input.setSelectionRange === 'function') {
        input.setSelectionRange(pos, pos);
      }
    });
  }

  function onPhoneKeyDown(e, phoneRef, onValidChange) {
    const input = e.target;
    const key = e.key;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentVal = phoneRef.value || '';
    const sub = getSubscriberDigits(currentVal);

    if (/^[0-9]$/.test(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      let subArr = sub.split('');
      let targetDigitIdx = 0;
      
      if (start !== end) {
        const startDigits = countDigitsBefore(currentVal, start);
        const endDigits = countDigitsBefore(currentVal, end);
        subArr.splice(startDigits, endDigits - startDigits, key);
        targetDigitIdx = startDigits + 1;
      } else {
        let digitsBefore = countDigitsBefore(currentVal, start);
        if (sub.length >= 10 && digitsBefore < 10) {
          subArr[digitsBefore] = key;
          targetDigitIdx = digitsBefore + 1;
        } else if (sub.length < 10) {
          subArr.splice(digitsBefore, 0, key);
          targetDigitIdx = digitsBefore + 1;
        } else {
          return;
        }
      }

      const newSub = subArr.join('').slice(0, 10);
      const formatted = formatSubscriber(newSub);
      phoneRef.value = formatted;
      const newPos = getCaretPosAfterDigits(formatted, targetDigitIdx);
      setCaret(input, newPos);
      if (onValidChange) onValidChange();
      return;
    }

    if (key === 'Backspace' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (start !== end) {
        e.preventDefault();
        const startDigits = countDigitsBefore(currentVal, start);
        const endDigits = countDigitsBefore(currentVal, end);
        let subArr = sub.split('');
        subArr.splice(startDigits, endDigits - startDigits);
        const newSub = subArr.join('');
        const formatted = formatSubscriber(newSub);
        phoneRef.value = formatted;
        const newPos = getCaretPosAfterDigits(formatted, startDigits);
        setCaret(input, newPos);
        if (onValidChange) onValidChange();
        return;
      }
      
      if (start <= 4) {
        e.preventDefault();
        setCaret(input, 4);
        return;
      }

      e.preventDefault();
      let digitsBefore = countDigitsBefore(currentVal, start);
      if (digitsBefore > 0) {
        let subArr = sub.split('');
        subArr.splice(digitsBefore - 1, 1);
        const newSub = subArr.join('');
        const formatted = formatSubscriber(newSub);
        phoneRef.value = formatted;
        const newPos = getCaretPosAfterDigits(formatted, digitsBefore - 1);
        setCaret(input, newPos);
        if (onValidChange) onValidChange();
      }
      return;
    }

    if (key === 'Delete' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (start !== end) {
        e.preventDefault();
        const startDigits = countDigitsBefore(currentVal, start);
        const endDigits = countDigitsBefore(currentVal, end);
        let subArr = sub.split('');
        subArr.splice(startDigits, endDigits - startDigits);
        const newSub = subArr.join('');
        const formatted = formatSubscriber(newSub);
        phoneRef.value = formatted;
        const newPos = getCaretPosAfterDigits(formatted, startDigits);
        setCaret(input, newPos);
        if (onValidChange) onValidChange();
        return;
      }

      let digitsBefore = countDigitsBefore(currentVal, start);
      if (digitsBefore < sub.length) {
        e.preventDefault();
        let subArr = sub.split('');
        subArr.splice(digitsBefore, 1);
        const newSub = subArr.join('');
        const formatted = formatSubscriber(newSub);
        phoneRef.value = formatted;
        const newPos = getCaretPosAfterDigits(formatted, digitsBefore);
        setCaret(input, newPos);
        if (onValidChange) onValidChange();
      }
      return;
    }
  }

  function onPhoneInput(e, phoneRef, onValidChange) {
    const input = e.target;
    const start = input.selectionStart;
    const digitsBefore = countDigitsBefore(input.value, start);
    const sub = getSubscriberDigits(input.value);
    const formatted = formatSubscriber(sub);
    phoneRef.value = formatted;
    const newPos = getCaretPosAfterDigits(formatted, digitsBefore);
    setCaret(input, newPos);
    if (onValidChange) onValidChange();
  }

  function validatePhoneNumber(phone) {
    const digits = (phone || '').replace(/\D/g, '');
    const subscriber = digits.startsWith('7') || digits.startsWith('8') ? digits.slice(1) : digits;
    
    if (!phone || !phone.trim()) {
      return 'Укажите номер телефона';
    }
    if (subscriber.length < 10) {
      return 'Укажите полный номер: 10 цифр (+7 (XXX) XXX-XX-XX)';
    }
    if (!/^[3489]\d{9}$/.test(subscriber)) {
      return 'Неверный код оператора (ожидается +7 9XX...)';
    }
    if (/^(\d)\1{9}$/.test(subscriber)) {
      return 'Укажите действующий номер телефона';
    }
    return '';
  }

  function validateEmailAddress(email) {
    const trimmed = (email || '').trim();
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmed) {
      return 'Укажите адрес электронной почты';
    }
    if (!pattern.test(trimmed) || trimmed.includes('..')) {
      return 'Укажите корректный email (например: name@mail.ru)';
    }
    return '';
  }

  return {
    getSubscriberDigits,
    formatSubscriber,
    onPhoneKeyDown,
    onPhoneInput,
    validatePhoneNumber,
    validateEmailAddress
  };
}
