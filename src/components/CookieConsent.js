import { CookieModal } from 'hds-react';
import React from 'react';

function CookieConsent() {
  const contentSource = {
      siteName: 'Test',
      currentLanguage: 'fi',
      optionalCookies: {
        cookies: [
          {
            commonGroup: 'statistics',
            commonCookie: 'matomo'
          }
        ]
      },
    focusTargetSelector: '#main-content',
    onAllConsentsGiven: function (consents) {
      if (consents.matomo) {
        // Start Matomo tracking if consent is given
      }
    }
  };

  return (
    <>
      <CookieModal contentSource={contentSource} />
    </>
  );
}

export default CookieConsent;
