export class ApiClient {
  async categorizeHighlight(highlight, categories, apiKey, prompt, maxRetries = 3) {
    const formattedPrompt = this.buildPrompt(highlight, categories, prompt);
    let attempts = 0;
    
    while (attempts < maxRetries) {
      attempts++;
      try {
        const response = await this.makeApiCall(formattedPrompt, apiKey);
        const result = this.parseResponse(response);
        const matchedCategory = this.findMatchingCategory(result, categories);
        
        if (matchedCategory) {
          this.logResult(highlight, matchedCategory, true);
          return matchedCategory;
        } else {
          this.logResult(highlight, result, false, attempts, maxRetries);
          if (attempts === maxRetries) {
            throw new Error('No matching category found after all retries');
          }
          await this.delay(1000 * attempts);
        }
      } catch (error) {
        this.logError(highlight, error, attempts, maxRetries);
        if (attempts === maxRetries) throw error;
        await this.delay(1000 * attempts);
      }
    }
  }

  buildPrompt(highlight, categories, promptTemplate) {
    const formattedPrompt = promptTemplate
      .replace('[highlight]', highlight)
      .replace('[categories]', categories.join(', '));

    return {
      messages: [{
        role: "system",
        content: "You are a book highlights categorizer. Respond only with the category name."
      }, {
        role: "user",
        content: formattedPrompt
      }],
      temperature: 0.3,
      max_tokens: 50
    };
  }

  async makeApiCall(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        ...prompt
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  }

  parseResponse(response) {
    return response.choices[0].message.content.trim();
  }

  findMatchingCategory(result, categories) {
    return categories.find(c => c.toLowerCase() === result.toLowerCase());
  }

  logResult(highlight, category, success, attempt = null, maxRetries = null) {
    const logger = document.getElementById('apiLog');
    const logEntry = document.createElement('div');
    logEntry.className = 'mb-3 p-2 rounded ' + (success ? 'bg-green-50' : 'bg-red-50');

    const truncatedHighlight = highlight.length > 80 ? 
      highlight.substring(0, 80) + '...' : 
      highlight;

    const currentCount = document.querySelectorAll('#apiLog > div').length + 1;
    const totalHighlights = document.getElementById('highlights').value.split('\n').filter(line => line.trim()).length;

    if (success) {
      logEntry.innerHTML = `
        <div class="text-gray-800">Line (${currentCount}) of (${totalHighlights}) was categorized successfully with the category <strong>[${category}]</strong></div>
        <div class="text-gray-600 mt-1">${truncatedHighlight}</div>
      `;
    } else {
      logEntry.innerHTML = `
        <div class="text-red-600">Failed to categorize (attempt ${attempt} of ${maxRetries})</div>
        <div class="text-gray-600 mt-1">${truncatedHighlight}</div>
      `;
    }

    logger.insertBefore(logEntry, logger.firstChild);
  }

  logError(highlight, error, attempt, maxRetries) {
    const logger = document.getElementById('apiLog');
    const logEntry = document.createElement('div');
    logEntry.className = 'mb-3 p-2 rounded bg-red-50';

    const truncatedHighlight = highlight.length > 80 ? 
      highlight.substring(0, 80) + '...' : 
      highlight;

    logEntry.innerHTML = `
      <div class="text-red-600">Error processing highlight (attempt ${attempt} of ${maxRetries})</div>
      <div class="text-gray-600 mt-1">${truncatedHighlight}</div>
      <div class="text-red-500 text-sm mt-1">${error.message}</div>
    `;

    logger.insertBefore(logEntry, logger.firstChild);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}