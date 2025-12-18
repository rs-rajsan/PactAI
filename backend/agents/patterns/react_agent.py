"""ReACT Pattern Agent - Reasoning-Action-Observation cycles."""

from typing import Dict, Any, List
from dataclasses import dataclass
from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)


@dataclass
class ReACTStep:
    reasoning: str
    action: str
    observation: str
    confidence: float
    iteration: int


class ReACTAction(ABC):
    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        pass


class ClauseSearchAction(ReACTAction):
    def __init__(self, search_terms: List[str]):
        self.search_terms = search_terms
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        contract_text = context.get('contract_text', '')
        results = []
        
        for term in self.search_terms:
            matches = []
            lines = contract_text.split('\n')
            for i, line in enumerate(lines):
                if term.lower() in line.lower():
                    matches.append({
                        'line_number': i + 1,
                        'content': line.strip(),
                        'context': ' '.join(lines[max(0, i-1):i+2])
                    })
            
            results.append({'term': term, 'matches': matches, 'count': len(matches)})
        
        return {'search_results': results, 'total_matches': sum(r['count'] for r in results)}


class ReACTAgent:
    def __init__(self, max_iterations: int = 3):
        self.max_iterations = max_iterations
        self.steps: List[ReACTStep] = []
    
    async def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        try:
            query = context.get('query', '')
            contract_text = context.get('contract_text', '')
            
            if not query or not contract_text:
                return {'error': 'Missing query or contract text'}
            
            working_context = {'contract_text': contract_text, 'original_query': query, 'findings': []}
            
            for iteration in range(self.max_iterations):
                step = await self._execute_react_cycle(working_context, iteration)
                self.steps.append(step)
                
                if step.confidence >= 0.8:
                    break
                
                working_context['previous_steps'] = self.steps
            
            return {
                'success': True,
                'steps': [self._step_to_dict(step) for step in self.steps],
                'final_confidence': self.steps[-1].confidence if self.steps else 0.0,
                'findings': working_context.get('findings', [])
            }
            
        except Exception as e:
            logger.error(f"ReACT agent error: {e}")
            return {'error': str(e)}
    
    async def _execute_react_cycle(self, context: Dict[str, Any], iteration: int) -> ReACTStep:
        reasoning = self._generate_reasoning(context, iteration)
        action_desc, observation = await self._execute_action(context, reasoning, iteration)
        confidence = self._calculate_confidence(observation, iteration)
        
        return ReACTStep(reasoning, action_desc, observation, confidence, iteration)
    
    def _generate_reasoning(self, context: Dict[str, Any], iteration: int) -> str:
        query = context.get('original_query', '')
        
        if iteration == 0:
            return f"Initial analysis: Need to find '{query}' in contract. Starting broad search."
        else:
            return f"Previous search needs refinement. Focusing on more specific terms."
    
    async def _execute_action(self, context: Dict[str, Any], reasoning: str, iteration: int) -> tuple[str, str]:
        query = context.get('original_query', '')
        
        if iteration == 0:
            action = ClauseSearchAction([query])
            action_desc = f"Searching for '{query}'"
        else:
            refined_terms = self._get_refined_terms(query)
            action = ClauseSearchAction(refined_terms)
            action_desc = f"Refined search: {refined_terms}"
        
        result = await action.execute(context)
        context['findings'].extend(self._extract_findings(result))
        observation = self._generate_observation(result)
        
        return action_desc, observation
    
    def _get_refined_terms(self, query: str) -> List[str]:
        if 'termination' in query.lower():
            return ['termination rights', 'notice period', 'termination clause']
        elif 'liability' in query.lower():
            return ['liability cap', 'limitation of liability', 'damages']
        return [query, f"{query} clause"]
    
    def _extract_findings(self, result: Dict[str, Any]) -> List[Dict[str, Any]]:
        findings = []
        for search_result in result.get('search_results', []):
            for match in search_result.get('matches', []):
                findings.append({
                    'type': 'clause_match',
                    'content': match['content'],
                    'line_number': match['line_number']
                })
        return findings
    
    def _generate_observation(self, result: Dict[str, Any]) -> str:
        total_matches = result.get('total_matches', 0)
        
        if total_matches == 0:
            return "No matches found. Need broader search terms."
        elif total_matches > 10:
            return f"Found {total_matches} matches, many irrelevant. Need refinement."
        else:
            return f"Found {total_matches} relevant matches."
    
    def _calculate_confidence(self, observation: str, iteration: int) -> float:
        base_confidence = 0.3 + (iteration * 0.2)
        
        if 'no matches' in observation.lower():
            return max(0.1, base_confidence - 0.3)
        elif 'irrelevant' in observation.lower():
            return max(0.4, base_confidence)
        elif 'relevant' in observation.lower():
            return min(0.9, base_confidence + 0.4)
        
        return base_confidence
    
    def _step_to_dict(self, step: ReACTStep) -> Dict[str, Any]:
        return {
            'iteration': step.iteration,
            'reasoning': step.reasoning,
            'action': step.action,
            'observation': step.observation,
            'confidence': step.confidence
        }