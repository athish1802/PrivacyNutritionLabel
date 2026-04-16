// Privacy Policy URL Resolver
// Uses a hybrid approach: API, URL validation, and link detection

class PolicyUrlResolver {
  constructor() {
    this.privacySpyCache = null;
    this.cacheExpiry = null;
    this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Main method to resolve privacy policy URL for a domain
   * Uses multiple strategies in order of reliability
   */
  async resolvePrivacyPolicyUrl(domain, detectedUrl = null) {
    // Strategy 1: Use detected URL from page scanning (if available and valid)
    if (detectedUrl) {
      const isValid = await this.validateUrl(detectedUrl);
      if (isValid) {
        console.log(`Using detected URL for ${domain}: ${detectedUrl}`);
        return {
          url: detectedUrl,
          source: 'page_detection',
          confidence: 'HIGH'
        };
      }
    }

    // Strategy 2: Check PrivacySpy API
    const apiResult = await this.getFromPrivacySpy(domain);
    if (apiResult) {
      console.log(`Using PrivacySpy URL for ${domain}: ${apiResult.url}`);
      return {
        url: apiResult.url,
        source: 'privacyspy_api',
        confidence: 'HIGH',
        score: apiResult.score
      };
    }

    // Strategy 3: Try common URL patterns with validation
    const validatedUrl = await this.tryCommonPatterns(domain);
    if (validatedUrl) {
      console.log(`Found valid URL pattern for ${domain}: ${validatedUrl}`);
      return {
        url: validatedUrl,
        source: 'validated_pattern',
        confidence: 'MEDIUM'
      };
    }

    // Strategy 4: Fallback to most common pattern (unvalidated)
    const fallbackUrl = `https://${domain}/privacy`;
    console.log(`Using fallback URL for ${domain}: ${fallbackUrl}`);
    return {
      url: fallbackUrl,
      source: 'fallback',
      confidence: 'LOW'
    };
  }

  /**
   * Fetch privacy policy URL from PrivacySpy API
   */
  async getFromPrivacySpy(domain) {
    try {
      // Load and cache the PrivacySpy database
      await this.loadPrivacySpyDatabase();

      if (!this.privacySpyCache) {
        return null;
      }

      // Find product matching this domain
      const product = this.privacySpyCache.find(p => {
        if (!p.hostnames || !Array.isArray(p.hostnames)) return false;

        // Check exact match or parent domain match
        return p.hostnames.some(hostname => {
          return domain === hostname ||
                 domain.endsWith(`.${hostname}`) ||
                 hostname.endsWith(`.${domain}`);
        });
      });

      if (product && product.sources && product.sources.length > 0) {
        return {
          url: product.sources[0],
          score: product.score,
          name: product.name
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching from PrivacySpy:', error);
      return null;
    }
  }

  /**
   * Load PrivacySpy database with caching
   */
  async loadPrivacySpyDatabase() {
    // Check if cache is still valid
    if (this.privacySpyCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return;
    }

    try {
      const response = await fetch('https://privacyspy.org/api/v2/products.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.privacySpyCache = await response.json();
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      console.log(`Loaded ${this.privacySpyCache.length} products from PrivacySpy`);
    } catch (error) {
      console.error('Failed to load PrivacySpy database:', error);
      this.privacySpyCache = null;
    }
  }

  /**
   * Try common privacy policy URL patterns and validate them
   */
  async tryCommonPatterns(domain) {
    const patterns = [
      `https://${domain}/privacy`,
      `https://${domain}/privacy-policy`,
      `https://${domain}/legal/privacy`,
      `https://${domain}/privacy.html`,
      `https://www.${domain}/privacy`,
      `https://www.${domain}/privacy-policy`,
      `https://www.${domain}/legal/privacy`,
      `https://${domain}/en/privacy`,
      `https://${domain}/help/privacy`,
      `https://${domain}/pages/privacy`,
    ];

    // Try each pattern
    for (const url of patterns) {
      const isValid = await this.validateUrl(url);
      if (isValid) {
        return url;
      }
    }

    return null;
  }

  /**
   * Validate if a URL exists and returns a valid page
   * Uses HEAD request to avoid downloading full content
   */
  async validateUrl(url) {
    try {
      // Use fetch with HEAD method for efficiency
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      // Consider 200-399 as valid
      return response.ok || (response.status >= 300 && response.status < 400);
    } catch (error) {
      // URL doesn't exist or request failed
      return false;
    }
  }

  /**
   * Clear the cache (useful for testing or manual refresh)
   */
  clearCache() {
    this.privacySpyCache = null;
    this.cacheExpiry = null;
  }
}

// Create singleton instance
const policyUrlResolver = new PolicyUrlResolver();
