from backend.domain.entities import IContractAnalyzer
from backend.tools.contract_search_tool import CONTRACT_TYPES
from typing import Dict, Any
import json
import logging

logger = logging.getLogger(__name__)

class LLMContractAnalyzer(IContractAnalyzer):
    """Contract analysis using LLM - reuses existing infrastructure"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def analyze_contract(self, text: str) -> Dict[str, Any]:
        """Analyze contract text and extract structured data"""
        
        # Truncate text for LLM processing
        analysis_text = text[:8000] if len(text) > 8000 else text
        
        analysis_prompt = f"""
        You are a contract analysis expert. Analyze this document and return ONLY a valid JSON object.

        Document text:
        {analysis_text}

        Return exactly this JSON structure with no additional text:
        {{
            "is_contract": true,
            "confidence_score": 0.9,
            "contract_type": "MSA",
            "summary": "Brief contract summary",
            "parties": [
                {{"name": "Company Name", "role": "Client"}}
            ],
            "effective_date": "2024-01-01",
            "end_date": "2025-01-01",
            "total_amount": 100000,
            "governing_law": "United States",
            "key_terms": ["services", "payment", "term"]
        }}

        Rules:
        - Return ONLY the JSON object, no explanations
        - Use contract_type from: {CONTRACT_TYPES[:10]}  
        - Set is_contract to false if not a legal contract
        - Use null for missing dates/amounts
        - Confidence 0.0-1.0 based on clarity
        """
        
        try:
            # Use sync invoke to avoid async issues
            response = self.llm.invoke(analysis_prompt)
            
            # Extract JSON from response
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            # Try to parse JSON with better error handling
            try:
                # Clean the response text
                cleaned_text = response_text.strip()
                
                # Try to find JSON block
                json_start = -1
                json_end = -1
                
                # Look for JSON markers
                for start_marker in ['{', '```json\n{', '```\n{']:
                    idx = cleaned_text.find(start_marker)
                    if idx != -1:
                        json_start = idx if start_marker == '{' else idx + len(start_marker) - 1
                        break
                
                if json_start != -1:
                    # Find the matching closing brace
                    brace_count = 0
                    for i in range(json_start, len(cleaned_text)):
                        if cleaned_text[i] == '{':
                            brace_count += 1
                        elif cleaned_text[i] == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                json_end = i + 1
                                break
                
                if json_start != -1 and json_end != -1:
                    json_str = cleaned_text[json_start:json_end]
                    result = json.loads(json_str)
                else:
                    raise ValueError("No valid JSON found in response")
                    
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Failed to parse LLM response as JSON: {e}")
                logger.error(f"Raw response: {response_text[:500]}...")
                
                # Create fallback result based on basic text analysis
                is_likely_contract = any(word in response_text.lower() for word in 
                    ['agreement', 'contract', 'party', 'parties', 'terms', 'conditions'])
                
                result = {
                    "is_contract": is_likely_contract,
                    "confidence_score": 0.3 if is_likely_contract else 0.0,
                    "contract_type": "MSA" if 'master service' in response_text.lower() else "Service",
                    "summary": "Contract analysis completed with limited parsing",
                    "parties": [],
                    "effective_date": None,
                    "end_date": None,
                    "total_amount": None,
                    "governing_law": None,
                    "key_terms": []
                }
            
            # Validate and clean result
            result = self._validate_analysis_result(result)
            
            logger.info(f"Contract analysis completed. Is contract: {result.get('is_contract')}, "
                       f"Confidence: {result.get('confidence_score')}")
            
            return result
            
        except Exception as e:
            logger.error(f"Contract analysis failed: {e}")
            raise
    
    def _validate_analysis_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean the analysis result"""
        
        # Ensure required fields exist
        defaults = {
            "is_contract": False,
            "confidence_score": 0.0,
            "contract_type": "Unknown",
            "summary": "",
            "parties": [],
            "effective_date": None,
            "end_date": None,
            "total_amount": None,
            "governing_law": None,
            "key_terms": []
        }
        
        for key, default_value in defaults.items():
            if key not in result:
                result[key] = default_value
        
        # Validate contract type
        if result["contract_type"] not in CONTRACT_TYPES:
            result["contract_type"] = "Service"  # Default fallback
        
        # Ensure confidence score is between 0 and 1
        confidence = result.get("confidence_score", 0.0)
        result["confidence_score"] = max(0.0, min(1.0, float(confidence)))
        
        return result