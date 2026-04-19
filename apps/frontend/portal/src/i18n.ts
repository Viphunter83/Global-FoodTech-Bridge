import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from './navigation';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
      console.warn(`[I18N] Invalid locale requested: ${locale}. Falling back to 404.`);
      notFound();
  }

  try {
      const messages = (await import(`../messages/${locale}.json`)).default;
      return {
          locale: locale as string,
          messages
      };
  } catch (error) {
      console.error(`[I18N] Failed to load messages for locale: ${locale}`, error);
      // Fallback to empty messages to prevent total crash, but log the failure
      return {
          locale,
          messages: {}
      };
  }
});
