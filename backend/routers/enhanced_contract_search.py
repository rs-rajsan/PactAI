from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field
from ..tools.enhanced_contract_search_tool import (
    EnhancedContractSearchTool, 
    SearchLevel, 
    MonetaryValue, 
    Location
)

router = APIRouter(prefix="/api/contracts", tags=["Enhanced Contract Search"])

# Request models
class ClauseSearchRequest(BaseModel):
    clause_types: List[str] = Field(..., description="CUAD clause types to search")
    query: Optional[str] = Field(None, description="Semantic search query")
    limit: Optional[int] = Field(10, description="Maximum results to return")

class SectionSearchRequest(BaseModel):
    section_types: List[str] = Field(..., description="Section types to search")
    query: Optional[str] = Field(None, description="Semantic search query")
    limit: Optional[int] = Field(10, description="Maximum results to return")

class RelationshipSearchRequest(BaseModel):
    parties: Optional[List[str]] = Field(None, description="Party names to search")
    query: Optional[str] = Field(None, description="Semantic search query")
    limit: Optional[int] = Field(10, description="Maximum results to return")

class EnhancedSearchRequest(BaseModel):
    search_level: SearchLevel = Field(SearchLevel.DOCUMENT, description="Search level")
    query: Optional[str] = Field(None, description="Semantic search query")
    clause_types: Optional[List[str]] = Field(None, description="CUAD clause types")
    section_types: Optional[List[str]] = Field(None, description="Section types")
    parties: Optional[List[str]] = Field(None, description="Party names")
    
    # Date filters
    min_effective_date: Optional[str] = Field(None, description="Min effective date (YYYY-MM-DD)")
    max_effective_date: Optional[str] = Field(None, description="Max effective date (YYYY-MM-DD)")
    min_end_date: Optional[str] = Field(None, description="Min end date (YYYY-MM-DD)")
    max_end_date: Optional[str] = Field(None, description="Max end date (YYYY-MM-DD)")
    
    # Other filters
    contract_type: Optional[str] = Field(None, description="Contract type")
    active: Optional[bool] = Field(None, description="Active contracts only")
    monetary_value: Optional[MonetaryValue] = Field(None, description="Monetary value filter")
    governing_law: Optional[Location] = Field(None, description="Governing law location")

# Initialize the enhanced search tool
search_tool = EnhancedContractSearchTool()

@router.post("/search/enhanced")
async def enhanced_contract_search(request: EnhancedSearchRequest):
    """Enhanced contract search with multi-level embedding support"""
    try:
        result = search_tool._run(
            search_level=request.search_level,
            clause_types=request.clause_types,
            section_types=request.section_types,
            summary_search=request.query,
            parties=request.parties,
            min_effective_date=request.min_effective_date,
            max_effective_date=request.max_effective_date,
            min_end_date=request.min_end_date,
            max_end_date=request.max_end_date,
            contract_type=request.contract_type,
            active=request.active,
            monetary_value=request.monetary_value,
            governing_law=request.governing_law
        )
        
        return {
            "success": True,
            "search_level": request.search_level,
            "results": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/search/clauses")
async def search_clauses(request: ClauseSearchRequest):
    """Search contracts by specific clause types"""
    try:
        result = search_tool._run(
            search_level=SearchLevel.CLAUSE,
            clause_types=request.clause_types,
            summary_search=request.query
        )
        
        return {
            "success": True,
            "clause_types": request.clause_types,
            "results": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clause search failed: {str(e)}")

@router.post("/search/sections")
async def search_sections(request: SectionSearchRequest):
    """Search contracts by document sections"""
    try:
        result = search_tool._run(
            search_level=SearchLevel.SECTION,
            section_types=request.section_types,
            summary_search=request.query
        )
        
        return {
            "success": True,
            "section_types": request.section_types,
            "results": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Section search failed: {str(e)}")

@router.post("/search/relationships")
async def search_relationships(request: RelationshipSearchRequest):
    """Search contracts by party relationships"""
    try:
        result = search_tool._run(
            search_level=SearchLevel.RELATIONSHIP,
            parties=request.parties,
            summary_search=request.query
        )
        
        return {
            "success": True,
            "parties": request.parties,
            "results": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Relationship search failed: {str(e)}")

@router.get("/search/clause-types")
async def get_clause_types():
    """Get list of available CUAD clause types"""
    clause_types = [
        "Document Name", "Parties", "Agreement Date", "Effective Date", "Expiration Date",
        "Renewal Term", "Notice Period To Terminate Renewal", "Governing Law", 
        "Most Favored Nation", "Non-Compete", "Exclusivity", "No-Solicit Of Customers",
        "No-Solicit Of Employees", "Non-Disparagement", "Termination For Convenience",
        "Rofr/Rofo/Rofn", "Change Of Control", "Anti-Assignment", "Revenue/Customer Sharing",
        "Price Restrictions", "Minimum Commitment", "Volume Restriction", "IP Ownership Assignment",
        "Joint IP Ownership", "License Grant", "Non-Transferable License", "Affiliate License-Licensor",
        "Affiliate License-Licensee", "Unlimited/All-You-Can-Eat-License", "Irrevocable Or Perpetual License",
        "Source Code Escrow", "Post-Termination Services", "Audit Rights", "Uncapped Liability",
        "Cap On Liability", "Liquidated Damages", "Warranty Duration", "Insurance",
        "Covenant Not To Sue", "Third Party Beneficiary", "Escrow"
    ]
    
    return {
        "success": True,
        "clause_types": clause_types,
        "total_count": len(clause_types)
    }

@router.get("/search/section-types")
async def get_section_types():
    """Get list of available section types"""
    section_types = [
        {"value": "payment", "label": "Payment Terms", "description": "Payment schedules, fees, costs"},
        {"value": "termination", "label": "Termination", "description": "Contract ending conditions"},
        {"value": "liability", "label": "Liability", "description": "Damages, losses, limitations"},
        {"value": "intellectual_property", "label": "Intellectual Property", "description": "IP rights, patents, copyrights"},
        {"value": "confidentiality", "label": "Confidentiality", "description": "Non-disclosure, proprietary info"},
        {"value": "general", "label": "General", "description": "Other contract sections"}
    ]
    
    return {
        "success": True,
        "section_types": section_types,
        "total_count": len(section_types)
    }