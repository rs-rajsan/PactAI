from backend.shared.utils.contract_search_tool import ContractSearchTool
from backend.shared.utils.enhanced_contract_search_tool import EnhancedContractSearchTool
from langchain_core.messages import SystemMessage
from langgraph.graph import START, MessagesState, StateGraph
# from langgraph.prebuilt import ToolNode, tools_condition
# Note: ToolNode import disabled to fix compatibility issues
# This file may need updates for newer LangGraph versions
from datetime import date


def get_agent(llm):
    # Define tools/llm
    tools = [ContractSearchTool(), EnhancedContractSearchTool()]
    llm_with_tools = llm.bind_tools(tools)

    # System message
    sys_msg = SystemMessage(
        content="You are a helpful assistant tasked with finding and explaining relevant information about internal contracts. "
        "Always explain results you get from the tools in a concise manner to not overwhelm the user but also don't be too technical. "
        "Answer questions as if you are answering to non-technical management level. "
        "Important: Be confident and accurate in your tool choice! Avoid asking follow-up questions if possible. "
        f"Today is {date.today()}"
    )

    # Node
    def assistant(state: MessagesState):
        return {"messages": [llm_with_tools.invoke([sys_msg] + state["messages"])]}

    # Simple tool execution function (replaces ToolNode)
    def execute_tools(state: MessagesState):
        from langchain_core.messages import ToolMessage
        messages = state["messages"]
        last_message = messages[-1]
        
        # Simple tool execution without ToolNode
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            # Execute tools manually
            tool_messages = []
            for tool_call in last_message.tool_calls:
                # Find and execute the tool
                for tool in tools:
                    if tool.name == tool_call['name']:
                        result = tool.invoke(tool_call['args'])
                        # Create proper ToolMessage
                        tool_message = ToolMessage(
                            content=str(result),
                            tool_call_id=tool_call['id']
                        )
                        tool_messages.append(tool_message)
            return {"messages": tool_messages}
        return {"messages": []}

    # Graph
    builder = StateGraph(MessagesState)

    # Define nodes: these do the work
    builder.add_node("assistant", assistant)
    builder.add_node("tools", execute_tools)

    # Define edges: these determine how the control flow moves
    builder.add_edge(START, "assistant")
    
    # Simple conditional logic (replaces tools_condition)
    def should_continue(state: MessagesState):
        messages = state["messages"]
        last_message = messages[-1]
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            return "tools"
        return "__end__"
    
    builder.add_conditional_edges("assistant", should_continue)
    builder.add_edge("tools", "assistant")
    return builder.compile()
