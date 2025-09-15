"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Paperclip, Send, Upload, Bot, Menu, Settings, MessageSquare, Plus, MoreVertical, Edit, Download, Trash2, FileText, File } from "lucide-react";
import { AGENTS, getDefaultAgent, Agent, getAgentWithConfigById } from "@/lib/agents/config";
import { formatTimestamp, formatFileSize, Conversation, ConversationMessage, RagDocument } from "@/lib/mock-data";

export default function Chat() {
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(getDefaultAgent());
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [dynamicAgents, setDynamicAgents] = useState<Agent[]>(AGENTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [agentToConfig, setAgentToConfig] = useState<Agent | null>(null);
  const [editedSystemPrompt, setEditedSystemPrompt] = useState("");
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [renamingConversation, setRenamingConversation] = useState<string | null>(null);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [editedAgentName, setEditedAgentName] = useState("");
  const [editedAgentAvatar, setEditedAgentAvatar] = useState("");
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [appTitle, setAppTitle] = useState("");
  const [settingsData, setSettingsData] = useState<Record<string, string>>({});
  const [editedApiKey, setEditedApiKey] = useState("");
  const [editedAppTitle, setEditedAppTitle] = useState("");
  const [editedOpenAIModel, setEditedOpenAIModel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const configFileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages } = useChat();

  // Load dynamic agent configurations and settings on component mount
  useEffect(() => {
    const loadAgentsWithConfigs = async () => {
      try {
        const agentsWithConfigs = await Promise.all(
          AGENTS.map(async (agent) => {
            const configuredAgent = await getAgentWithConfigById(agent.id);
            return configuredAgent || agent;
          })
        );
        setDynamicAgents(agentsWithConfigs);
        
        // Update selectedAgent if it has custom configuration
        const selectedWithConfig = agentsWithConfigs.find(a => a.id === selectedAgent.id);
        if (selectedWithConfig) {
          setSelectedAgent(selectedWithConfig);
        }
      } catch (error) {
        console.error('Error loading agent configurations:', error);
      }
    };

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          setSettingsData(settings);
          
          // Update app title from settings or use default
          setAppTitle(settings.app_title || "Multi-Agent RAG Chatbot");
        } else {
          setAppTitle("Multi-Agent RAG Chatbot");
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setAppTitle("Multi-Agent RAG Chatbot");
      }
    };

    loadAgentsWithConfigs();
    loadSettings();
  }, []);

  // Load conversations when agent changes
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await fetch(`/api/conversations?agentId=${selectedAgent.id}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    
    loadConversations();
  }, [selectedAgent.id]);

  // Function to create a new conversation
  const createNewConversation = async (title?: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || 'New conversation',
          agentId: selectedAgent.id,
        }),
      });
      
      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setConversationMessages([]);
        return newConversation;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    return null;
  };

  // Function to load conversation messages
  const loadConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    try {
      const response = await fetch(`/api/messages?conversationId=${conversation.id}`);
      if (response.ok) {
        const messages = await response.json();
        setConversationMessages(messages);
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
    
    // Set agent if different
    const conversationAgent = dynamicAgents.find(agent => agent.id === conversation.agentId);
    if (conversationAgent && conversationAgent.id !== selectedAgent.id) {
      setSelectedAgent(conversationAgent);
    }
  };

  // Function to open settings configuration dialog
  const openSettingsConfig = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        setSettingsData(settings);
        setEditedAppTitle(settings.app_title || appTitle || "Multi-Agent RAG Chatbot");
        setEditedApiKey(settings.openai_api_key === '***[CONFIGURED]***' ? '' : ''); // Don't pre-fill API key for security
        setEditedOpenAIModel(settings.openai_model || 'gpt-4o'); // Default model
      } else {
        setEditedAppTitle(appTitle || "Multi-Agent RAG Chatbot");
        setEditedApiKey('');
        setEditedOpenAIModel('gpt-4o');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setEditedAppTitle(appTitle || "Multi-Agent RAG Chatbot");
      setEditedApiKey('');
      setEditedOpenAIModel('gpt-4o');
    }
    
    setSettingsDialogOpen(true);
  };

  // Function to save settings configuration
  const saveSettingsConfig = async () => {
    try {
      const promises = [];
      
      // Always save app title
      promises.push(
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'app_title',
            value: editedAppTitle,
            description: 'Application title displayed in the header'
          })
        })
      );
      
      // Save API key only if provided (to update it)
      if (editedApiKey.trim()) {
        promises.push(
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'openai_api_key',
              value: editedApiKey.trim(),
              description: 'OpenAI API Key for AI responses'
            })
          })
        );
      }
      
      // Always save OpenAI model
      promises.push(
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'openai_model',
            value: editedOpenAIModel,
            description: 'OpenAI model for AI responses'
          })
        })
      );
      
      await Promise.all(promises);
      
      // Update local state
      setAppTitle(editedAppTitle);
      
      // Reload settings
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        setSettingsData(settings);
      }
      
      setSettingsDialogOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Function to open agent configuration dialog
  const openAgentConfig = async (agent: Agent) => {
    setAgentToConfig(agent);
    
    try {
      // Load agent configuration
      const configResponse = await fetch(`/api/agents/config?agentId=${agent.id}`);
      if (configResponse.ok) {
        const config = await configResponse.json();
        setEditedSystemPrompt(config.systemPrompt || agent.systemPrompt);
        setEditedAgentName(config.name || agent.name);
        setEditedAgentAvatar(config.avatar || agent.avatar);
      } else {
        setEditedSystemPrompt(agent.systemPrompt);
        setEditedAgentName(agent.name);
        setEditedAgentAvatar(agent.avatar);
      }
      
      // Load RAG documents
      const ragResponse = await fetch(`/api/resources?agentId=${agent.id}`);
      if (ragResponse.ok) {
        const resources = await ragResponse.json();
        // Transform resources to RagDocument format
        const docs: RagDocument[] = resources.map((resource: any) => {
          // Extract filename from content (format: "File: filename.ext\n\n...")
          const filenameMatch = resource.content.match(/^File: (.+)$/m);
          const filename = filenameMatch ? filenameMatch[1] : `Document_${resource.id.substring(0, 8)}.md`;
          
          // Determine file type from filename
          const extension = filename.toLowerCase().split('.').pop();
          const type = extension === 'pdf' ? 'pdf' : 'markdown';
          
          return {
            id: resource.id,
            filename: filename,
            type: type as 'pdf' | 'markdown',
            size: resource.content.length, // Use actual content length
            uploadDate: new Date(resource.createdAt),
            agentId: resource.agentId,
            url: `#${resource.id}`
          };
        });
        setRagDocuments(docs);
      } else {
        setRagDocuments([]);
      }
    } catch (error) {
      console.error('Error loading agent configuration:', error);
      setEditedSystemPrompt(agent.systemPrompt);
      setRagDocuments([]);
    }
    
    setConfigDialogOpen(true);
  };

  // Function to rename conversation
  const renameConversation = async (conversationId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        // Update the conversation in the local state
        setConversations(conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: newTitle }
            : conv
        ));
        
        // Update selected conversation if it's the one being renamed
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation({ ...selectedConversation, title: newTitle });
        }
      }
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
    
    setRenamingConversation(null);
    setNewConversationTitle("");
  };

  // Function to delete conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations?id=${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the conversation from local state
        setConversations(conversations.filter(conv => conv.id !== conversationId));
        
        // If this was the selected conversation, clear selection
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setConversationMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Function to save agent configuration
  const saveAgentConfig = async () => {
    if (agentToConfig) {
      try {
        const response = await fetch('/api/agents/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: agentToConfig.id,
            systemPrompt: editedSystemPrompt,
            ...(editedAgentName && { name: editedAgentName }),
            ...(editedAgentAvatar && { avatar: editedAgentAvatar })
          }),
        });
        
        if (response.ok) {
          console.log('Agent configuration saved successfully');
          
          // Reload the updated agent configuration
          const updatedAgent = await getAgentWithConfigById(agentToConfig.id);
          if (updatedAgent) {
            // Update in dynamicAgents array
            setDynamicAgents(prev => 
              prev.map(agent => agent.id === agentToConfig.id ? updatedAgent : agent)
            );
            
            // Update selectedAgent if it's the same agent
            if (selectedAgent.id === agentToConfig.id) {
              setSelectedAgent(updatedAgent);
            }
          }
          
          setConfigDialogOpen(false);
        } else {
          const error = await response.json();
          console.error('Error saving agent configuration:', error);
        }
      } catch (error) {
        console.error('Error saving agent configuration:', error);
      }
    }
  };

  // Function to handle document deletion
  const deleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/resources?resourceId=${docId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setRagDocuments(prev => prev.filter(doc => doc.id !== docId));
      } else {
        console.error('Error deleting document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  // Function to handle document download
  const downloadDocument = async (doc: RagDocument) => {
    try {
      // Fetch the resource content from the API
      const response = await fetch(`/api/resources?agentId=${doc.agentId}`);
      if (!response.ok) {
        console.error('Failed to fetch resources');
        return;
      }
      
      const resources = await response.json();
      const resource = resources.find((r: any) => r.id === doc.id);
      
      if (!resource) {
        console.error('Resource not found');
        return;
      }
      
      // Extract the actual file content (remove the "File: filename.ext\n\n" prefix)
      let content = resource.content;
      const filenameMatch = content.match(/^File: (.+)\n\n([\s\S]*)$/);
      if (filenameMatch) {
        content = filenameMatch[2]; // Get the content after the filename header
      }
      
      // Create a blob and download
      const blob = new Blob([content], { 
        type: doc.type === 'pdf' ? 'application/pdf' : 'text/plain' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  // Function to handle new file upload in config
  const handleConfigFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !agentToConfig) return;

    // Mock file upload - add to documents list
    Array.from(files).forEach(file => {
      const newDoc: RagDocument = {
        id: `doc-${Date.now()}-${Math.random()}`,
        filename: file.name,
        type: file.name.endsWith('.pdf') ? 'pdf' : 'markdown',
        size: file.size,
        uploadDate: new Date(),
        agentId: agentToConfig.id,
        url: "#"
      };
      setRagDocuments(prev => [newDoc, ...prev]);
    });

    // Reset file input
    if (configFileInputRef.current) {
      configFileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (text: string) => {
    let currentConversation = selectedConversation;
    
    // Create new conversation if none selected
    if (!currentConversation) {
      currentConversation = await createNewConversation();
      if (!currentConversation) return;
    }
    
    try {
      // Add user message to UI immediately
      const userMessage: ConversationMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date()
      };
      setConversationMessages(prev => [...prev, userMessage]);
      
      // Save user message to database
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversation.id,
          role: 'user',
          content: text
        })
      });
      
      // Prepare messages for AI
      const allMessages = [...conversationMessages, userMessage].map(m => ({ role: m.role, content: m.content }));
      
      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          agentId: selectedAgent.id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const assistantMessage = data.messages?.[data.messages.length - 1];
        
        if (assistantMessage) {
          // Add assistant message to UI
          const newAssistantMessage: ConversationMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: assistantMessage.content,
            timestamp: new Date()
          };
          setConversationMessages(prev => [...prev, newAssistantMessage]);
          
          // Save assistant message to database
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: currentConversation.id,
              role: 'assistant',
              content: assistantMessage.content
            })
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStatus("");

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('agentId', selectedAgent.id);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus(result.message);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto">
      {/* Header with Menu Button */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="p-4 flex items-center gap-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 flex flex-col">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Agents & Chat</SheetTitle>
                <SheetDescription>
                  Select an agent and manage your conversations
                </SheetDescription>
              </SheetHeader>
              
              {/* Sidebar Content */}
              <div className="flex flex-col h-full">

                {/* Agents Section */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm text-muted-foreground">AGENTS</h3>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {dynamicAgents.map((agent) => {
                      const IconComponent = agent.icon;
                      const isActive = selectedAgent.id === agent.id;
                      return (
                        <div key={agent.id} className="group relative">
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setSelectedConversation(null); // Reset conversation when changing agent
                              setConversationMessages([]); // Clear conversation messages
                              setSidebarOpen(false);
                            }}
                            className={`w-full justify-start gap-2 h-auto p-2 ${
                              isActive ? 'ring-1 ring-border' : ''
                            }`}
                          >
                            <span className="text-base">{agent.avatar}</span>
                            <IconComponent className="h-3 w-3" style={{ color: agent.bgColor }} />
                            <div className="flex flex-col items-start">
                              <span className="text-xs font-medium">{agent.name}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {agent.id === selectedAgent.id ? conversations.length : 0} conversations
                              </span>
                            </div>
                          </Button>
                          
                          {/* Agent Configuration Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAgentConfig(agent);
                            }}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Conversations Section */}
                <div className="flex-1 overflow-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm text-muted-foreground">
                        CONVERSATIONS - {selectedAgent.name.toUpperCase()}
                      </h3>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => createNewConversation()}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {conversations.map((conversation) => (
                        <div 
                          key={conversation.id}
                          className="group relative"
                        >
                          <Button
                            variant={selectedConversation?.id === conversation.id ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => {
                              loadConversation(conversation);
                              setSidebarOpen(false);
                            }}
                            className="w-full justify-start h-auto p-3 flex-col items-start text-left hover:bg-accent"
                          >
                            <div className="w-full flex items-start justify-between mb-1">
                              {renamingConversation === conversation.id ? (
                                <div className="flex-1 pr-6" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    value={newConversationTitle}
                                    onChange={(e) => setNewConversationTitle(e.target.value)}
                                    onBlur={() => {
                                      if (newConversationTitle.trim()) {
                                        renameConversation(conversation.id, newConversationTitle.trim());
                                      } else {
                                        setRenamingConversation(null);
                                        setNewConversationTitle("");
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        if (newConversationTitle.trim()) {
                                          renameConversation(conversation.id, newConversationTitle.trim());
                                        } else {
                                          setRenamingConversation(null);
                                          setNewConversationTitle("");
                                        }
                                      } else if (e.key === 'Escape') {
                                        setRenamingConversation(null);
                                        setNewConversationTitle("");
                                      }
                                    }}
                                    className="text-sm font-medium h-auto p-1"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <span className="text-sm font-medium leading-tight truncate pr-6">
                                  {conversation.title}
                                </span>
                              )}
                            </div>
                            <p className="w-full text-xs text-muted-foreground leading-relaxed mb-2 overflow-hidden"
                               style={{
                                 display: '-webkit-box',
                                 WebkitLineClamp: 2,
                                 WebkitBoxOrient: 'vertical'
                               }}>
                              {conversation.lastMessage}
                            </p>
                            <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
                              <span>{conversation.messageCount} messages</span>
                              <span>{formatTimestamp(conversation.timestamp)}</span>
                            </div>
                          </Button>
                          
                          {/* Options button - positioned absolutely */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRenamingConversation(conversation.id);
                                    setNewConversationTitle(conversation.title);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this conversation?')) {
                                      deleteConversation(conversation.id);
                                    }
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Settings at Bottom */}
                <div className="p-4 border-t mt-auto">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      openSettingsConfig();
                      setSidebarOpen(false);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Configuration</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">{appTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {selectedConversation 
                ? `${selectedAgent.name} - ${selectedConversation.title}`
                : `Chat with ${selectedAgent.name}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {uploadStatus && (
          <div className={`p-3 rounded-lg border ${
            uploadStatus.includes('Error') 
              ? 'bg-destructive/10 border-destructive text-destructive' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            {uploadStatus}
          </div>
        )}
        
        {/* Show conversation messages if a conversation is selected, otherwise show useChat messages */}
        {selectedConversation ? (
          // Conversation messages
          conversationMessages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : `${selectedAgent.color}/10 border border-current/20`
                }`}>
                  <div className="text-xs font-medium mb-1 opacity-70 flex items-center gap-1">
                    {msg.role === 'user' ? (
                      <>👤 Tu</>
                    ) : (
                      <>
                        <span>{selectedAgent.avatar}</span>
                        {selectedAgent.name}
                      </>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div className="text-xs opacity-50 mt-2">
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Live chat messages from useChat
          messages.map((m) => (
            <div key={m.id} className="space-y-2">
              <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  m.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : `${selectedAgent.color}/10 border border-current/20`
                }`}>
                  <div className="text-xs font-medium mb-1 opacity-70 flex items-center gap-1">
                    {m.role === 'user' ? (
                      <>👤 Tu</>
                    ) : (
                      <>
                        <span>{selectedAgent.avatar}</span>
                        {selectedAgent.name}
                      </>
                    )}
                  </div>
                  {m.parts.map((part, index) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div key={index} className="whitespace-pre-wrap">
                            {part.text}
                          </div>
                        );
                      case "tool-addResource":
                      case "tool-getInformation":
                        return (
                          <div key={index} className="space-y-2">
                            <div className="text-sm opacity-70">
                              {part.state === "output-available" ? "✓" : "⏳"} Tool: {part.type}
                            </div>
                            <pre className="text-xs bg-background/50 p-2 rounded border overflow-auto">
                              {JSON.stringify(part.input, null, 2)}
                            </pre>
                          </div>
                        );
                    }
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Bar - Two Rows */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.md,.markdown"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {/* First Row: Text Input + Send Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              handleSendMessage(input);
              setInput("");
            }
          }}
          className="flex gap-2 mb-3"
        >
          <Input
            value={input}
            placeholder="Write your message..."
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!input.trim()} 
            className="shrink-0 text-white"
            style={{ backgroundColor: selectedAgent.bgColor }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Second Row: Tools */}
        <div className="flex items-center gap-3">
          {/* File upload tool */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={triggerFileUpload}
            disabled={isUploading}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            {isUploading ? (
              <Upload className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
            <span className="text-sm">Attachments</span>
          </Button>

          {/* Agent selector */}
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedAgent.id}
              onChange={(e) => {
                const agent = dynamicAgents.find(a => a.id === e.target.value);
                if (agent) setSelectedAgent(agent);
              }}
              className="text-sm bg-transparent border-none focus:outline-none text-muted-foreground cursor-pointer"
            >
              {dynamicAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.avatar} {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Agent Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {agentToConfig ? (
                <>
                  <span className="text-xl">{agentToConfig.avatar}</span>
                  <span>Configuration {agentToConfig.name}</span>
                </>
              ) : (
                <span>Agent Configuration</span>
              )}
            </DialogTitle>
            <DialogDescription>
              Edit the system prompt and manage RAG documents for this agent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col flex-1 gap-6 overflow-hidden">
            {agentToConfig && (
              <div className="flex flex-col flex-1 gap-6 overflow-hidden">
              {/* Agent Info Section */}
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Agent Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Name</label>
                    <Input
                      value={editedAgentName}
                      onChange={(e) => setEditedAgentName(e.target.value)}
                      placeholder="Agent name"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Icon (Emoji)</label>
                    <Input
                      value={editedAgentAvatar}
                      onChange={(e) => setEditedAgentAvatar(e.target.value)}
                      placeholder="🤖"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* System Prompt Section */}
              <div className="flex flex-col">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  System Prompt
                </h3>
                <Textarea
                  value={editedSystemPrompt}
                  onChange={(e) => setEditedSystemPrompt(e.target.value)}
                  placeholder="Enter the system prompt for this agent..."
                  className="min-h-[200px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {editedSystemPrompt.length} characters
                </p>
              </div>

              {/* Bottom Section - RAG Documents */}
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    RAG Documents ({ragDocuments.length})
                  </h3>
                  <div className="flex gap-2">
                    <input
                      ref={configFileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.md,.markdown"
                      onChange={handleConfigFileUpload}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => configFileInputRef.current?.click()}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add File
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>File</TableHead>
                        <TableHead className="w-20">Size</TableHead>
                        <TableHead className="w-24">Uploaded</TableHead>
                        <TableHead className="w-20">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ragDocuments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No documents uploaded
                          </TableCell>
                        </TableRow>
                      ) : (
                        ragDocuments.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell>
                              {doc.type === 'pdf' ? (
                                <File className="h-4 w-4 text-red-500" />
                              ) : (
                                <FileText className="h-4 w-4 text-blue-500" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <p className="text-sm font-medium truncate">{doc.filename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.type.toUpperCase()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatFileSize(doc.size)}
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatTimestamp(doc.uploadDate)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => downloadDocument(doc)}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={() => deleteDocument(doc.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
              
          {/* Dialog Actions */}
              {agentToConfig && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveAgentConfig}>
                    Save Configuration
                  </Button>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Configuration Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>System Configuration</span>
            </DialogTitle>
            <DialogDescription>
              Edit the global application settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-6">
            {/* App Title Section */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Application Title
              </h3>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">Title</label>
                <Input
                  value={editedAppTitle}
                  onChange={(e) => setEditedAppTitle(e.target.value)}
                  placeholder="Multi-Agent RAG Chatbot"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This title will appear in the application header
                </p>
              </div>
            </div>

            {/* OpenAI API Key Section */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                OpenAI Configuration
              </h3>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">API Key</label>
                <Input
                  type="password"
                  value={editedApiKey}
                  onChange={(e) => setEditedApiKey(e.target.value)}
                  placeholder={settingsData.openai_api_key === '***[CONFIGURED]***' ? 'API Key configured (leave empty to keep)' : 'Enter your OpenAI API Key'}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {settingsData.openai_api_key === '***[CONFIGURED]***' 
                    ? 'An API Key is already configured. Enter a new key only if you want to replace it.'
                    : 'Enter your OpenAI API Key to enable AI features.'
                  }
                </p>
              </div>

              {/* OpenAI Model Section */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">OpenAI Model</label>
                <select
                  value={editedOpenAIModel}
                  onChange={(e) => setEditedOpenAIModel(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Economic)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select the OpenAI model to use for AI responses. GPT-4o offers the best performance.
                </p>
              </div>
            </div>
          </div>
              
          {/* Dialog Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettingsConfig}>
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}