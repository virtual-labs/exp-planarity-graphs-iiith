class PlanarGraphVisualization {
    constructor() {
        this.canvas = document.getElementById('graphCanvas');
        if (!this.canvas) {
            console.error('Canvas element with id "graphCanvas" not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context from canvas');
            return;
        }
        
        this.vertexCount = 6;
        this.edgeDensity = 0.5;
        this.vertices = [];
        this.edges = [];
        this.crossings = [];
        this.isDragging = false;
        this.dragVertex = null;
        this.dragOffset = { x: 0, y: 0 };
        this.currentGraph = null;
        this.solutionLayout = null;
        this.solutionSteps = [];
        this.currentSolutionStep = 0;
        this.showingSolution = false;
        this.isSolutionMode = false;
        this.learningTrace = [];

        // Visual constants
        this.vertexRadius = 25;
        this.colors = {
            vertex: '#3b82f6',
            vertexBorder: '#1e40af',
            edge: '#6b7280',
            crossingEdge: '#ef4444',
            background: '#ffffff',
            dragVertex: '#f59e0b',
            solutionVertex: '#10b981',
            solutionEdge: '#059669'
        };

        this.setupCanvas();
        this.setupEventListeners();
        this.updateUI();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
    }

    setupEventListeners() {
        const graphSelect = document.getElementById('graphSelect');
        if (graphSelect) {
            graphSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.loadGraph(e.target.value);
                }
            });
        }
        this.setupFloatingPanels();
    }

    setupFloatingPanels() {
        const controlsButton = document.getElementById('controlsButton');
        const controlsPanel = document.getElementById('controlsPanel');
        const controlsPanelClose = document.getElementById('controlsPanelClose');

        if (controlsButton && controlsPanel) {
            controlsButton.addEventListener('click', () => {
                controlsPanel.classList.toggle('active');
            });
            controlsPanelClose?.addEventListener('click', () => {
                controlsPanel.classList.remove('active');
            });
        }

        const infoButton = document.getElementById('infoButton');
        const infoPanel = document.getElementById('infoPanel');
        const infoPanelClose = document.getElementById('infoPanelClose');

        if (infoButton && infoPanel) {
            infoButton.addEventListener('click', () => {
                infoPanel.classList.toggle('active');
            });
            infoPanelClose?.addEventListener('click', () => {
                infoPanel.classList.remove('active');
            });
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerStyle = window.getComputedStyle(container);
        const containerWidth = container.clientWidth - 
            parseFloat(containerStyle.paddingLeft) - 
            parseFloat(containerStyle.paddingRight);
        const containerHeight = container.clientHeight - 
            parseFloat(containerStyle.paddingTop) - 
            parseFloat(containerStyle.paddingBottom);

        this.canvas.style.width = containerWidth + 'px';
        this.canvas.style.height = containerHeight + 'px';

        const scale = window.devicePixelRatio || 1;
        this.canvas.width = containerWidth * scale;
        this.canvas.height = containerHeight * scale;
        this.ctx.scale(scale, scale);
        
        // Redraw the current graph or clear canvas
        if (this.currentGraph) {
            this.draw();
        } else {
            // Clear canvas if no graph is loaded
            this.ctx.fillStyle = this.colors.background;
            this.ctx.fillRect(0, 0, containerWidth, containerHeight);
        }
    }

    loadGraph(type) {
        this.currentGraph = type;
        this.showingSolution = false;
        this.isSolutionMode = false;
        this.currentSolutionStep = 0;
        this.solutionSteps = [];
        this.clearLearningTrace();
        
        // Hide any existing overlays and panels
        if (this.isSuccessOverlayVisible()) {
            this.hideSuccessOverlay();
        }
        const nonPlanarOverlay = document.getElementById('nonPlanarOverlay');
        if (nonPlanarOverlay && !nonPlanarOverlay.classList.contains('hidden')) {
            this.hideNonPlanarOverlay();
        }
        this.hideSolutionPanel();
        
        switch(type) {
            case 'K4':
                this.generateK4();
                break;
            case 'K5':
                this.generateK5();
                break;
            case 'K33':
                this.generateK33();
                break;
            case 'cube':
                this.generateCube();
                break;
            case 'random':
                this.generateRandomGraph();
                break;
        }
        
        this.updateUI();
        this.addLearningTrace(`Loaded ${this.getGraphName(type)}`, 'info');
    }

    generateK4() {
        this.vertices = [];
        this.edges = [];
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        // Create 4 vertices in a square
        for (let i = 0; i < 4; i++) {
            const angle = (2 * Math.PI * i) / 4 - Math.PI / 4;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            this.vertices.push({ x, y, id: i, label: String.fromCharCode(65 + i) });
        }

        // Complete graph - all possible edges
        for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 4; j++) {
                this.edges.push({ v1: i, v2: j });
            }
        }

        this.solutionLayout = this.vertices.map(v => ({ x: v.x, y: v.y }));
        this.generateK4SolutionSteps();
        this.detectCrossings();
        this.draw();
    }

    generateK5() {
        this.vertices = [];
        this.edges = [];
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        // Create 5 vertices in a pentagon
        for (let i = 0; i < 5; i++) {
            const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            this.vertices.push({ x, y, id: i, label: String.fromCharCode(65 + i) });
        }

        // Complete graph - all possible edges
        for (let i = 0; i < 5; i++) {
            for (let j = i + 1; j < 5; j++) {
                this.edges.push({ v1: i, v2: j });
            }
        }

        this.solutionLayout = null; // K5 is non-planar
        this.detectCrossings();
        this.draw();
    }

    generateK33() {
        this.vertices = [];
        this.edges = [];
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        // Create bipartite graph: 3 vertices on left, 3 on right
        const spacing = Math.min(canvasWidth, canvasHeight) * 0.2;
        
        // Left side vertices
        for (let i = 0; i < 3; i++) {
            this.vertices.push({
                x: centerX - spacing,
                y: centerY + (i - 1) * spacing * 0.8,
                id: i,
                label: String.fromCharCode(65 + i)
            });
        }
        
        // Right side vertices
        for (let i = 0; i < 3; i++) {
            this.vertices.push({
                x: centerX + spacing,
                y: centerY + (i - 1) * spacing * 0.8,
                id: i + 3,
                label: String.fromCharCode(68 + i)
            });
        }

        // Connect each left vertex to each right vertex
        for (let i = 0; i < 3; i++) {
            for (let j = 3; j < 6; j++) {
                this.edges.push({ v1: i, v2: j });
            }
        }

        this.solutionLayout = null; // K3,3 is non-planar
        this.detectCrossings();
        this.draw();
    }

    generateCube() {
        this.vertices = [];
        this.edges = [];
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const size = Math.min(canvasWidth, canvasHeight) * 0.25;

        // Create cube vertices (8 vertices)
        const cubeVertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // back face
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]      // front face
        ];

        // Project 3D coordinates to 2D
        for (let i = 0; i < 8; i++) {
            const [x, y, z] = cubeVertices[i];
            const projX = centerX + (x + z * 0.3) * size;
            const projY = centerY + (y - z * 0.3) * size;
            this.vertices.push({ x: projX, y: projY, id: i, label: String.fromCharCode(65 + i) });
        }

        // Cube edges
        const cubeEdges = [
            [0,1], [1,2], [2,3], [3,0], // back face
            [4,5], [5,6], [6,7], [7,4], // front face
            [0,4], [1,5], [2,6], [3,7]  // connecting edges
        ];

        for (let [v1, v2] of cubeEdges) {
            this.edges.push({ v1, v2 });
        }

        // Store a planar solution layout
        this.generateCubeSolution();
        this.generateCubeSolutionSteps();
        this.detectCrossings();
        this.draw();
    }

    generateCubeSolution() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const size = Math.min(canvasWidth, canvasHeight) * 0.2;

        // Planar layout for cube graph - matches the solution steps
        this.solutionLayout = [
            { x: centerX - size, y: centerY - size },     // A (outer)
            { x: centerX + size, y: centerY - size },     // B (outer)
            { x: centerX + size, y: centerY + size },     // C (outer)
            { x: centerX - size, y: centerY + size },     // D (outer)
            { x: centerX - size * 0.3, y: centerY - size * 0.3 }, // E (inner)
            { x: centerX + size * 0.3, y: centerY - size * 0.3 }, // F (inner)
            { x: centerX + size * 0.3, y: centerY + size * 0.3 }, // G (inner)
            { x: centerX - size * 0.3, y: centerY + size * 0.3 }  // H (inner)
        ];
    }

    // Generate step-by-step solutions
    generateK4SolutionSteps() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        this.solutionSteps = [
            {
                step: 1,
                title: "Initial Layout",
                description: "K₄ (complete graph with 4 vertices) starts with vertices arranged in a square pattern.",
                vertices: this.vertices.map(v => ({ x: v.x, y: v.y })),
                message: "This initial layout shows all 6 edges of K₄, but some may cross."
            },
            {
                step: 2,
                title: "Arrange Outer Triangle", 
                description: "Move 3 vertices to form an outer triangle.",
                vertices: [
                    { x: centerX, y: centerY - radius },           // A - top
                    { x: centerX - radius * 0.866, y: centerY + radius * 0.5 }, // B - bottom left
                    { x: centerX + radius * 0.866, y: centerY + radius * 0.5 }, // C - bottom right
                    { x: centerX, y: centerY }                     // D - center (unchanged for now)
                ],
                message: "Three vertices form an outer triangle. This creates the outer face of our planar embedding."
            },
            {
                step: 3,
                title: "Position Center Vertex",
                description: "Place the 4th vertex inside the triangle.",
                vertices: [
                    { x: centerX, y: centerY - radius },           // A - top
                    { x: centerX - radius * 0.866, y: centerY + radius * 0.5 }, // B - bottom left  
                    { x: centerX + radius * 0.866, y: centerY + radius * 0.5 }, // C - bottom right
                    { x: centerX, y: centerY + radius * 0.2 }      // D - inside triangle
                ],
                message: "The 4th vertex is placed inside the triangle. All edges can now be drawn without crossings!"
            }
        ];
    }

    generateCubeSolutionSteps() {
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const size = Math.min(canvasWidth, canvasHeight) * 0.2;

        this.solutionSteps = [
            {
                step: 1,
                title: "Initial 3D Projection",
                description: "The cube graph starts as a 3D projection which may have crossing edges.",
                vertices: this.vertices.map(v => ({ x: v.x, y: v.y })),
                message: "This 3D projection of a cube often has edge crossings. A cube has 8 vertices and 12 edges."
            },
            {
                step: 2,
                title: "Create Outer 4-Cycle",
                description: "Arrange 4 vertices to form the outer boundary (one face of the cube).",
                vertices: [
                    { x: centerX - size, y: centerY - size },     // A (outer)
                    { x: centerX + size, y: centerY - size },     // B (outer)
                    { x: centerX + size, y: centerY + size },     // C (outer)  
                    { x: centerX - size, y: centerY + size },     // D (outer)
                    { x: centerX - size * 0.5, y: centerY - size * 0.5 }, // E
                    { x: centerX + size * 0.5, y: centerY - size * 0.5 }, // F
                    { x: centerX + size * 0.5, y: centerY + size * 0.5 }, // G
                    { x: centerX - size * 0.5, y: centerY + size * 0.5 }  // H
                ],
                message: "Four vertices (A,B,C,D) form the outer square. The remaining 4 vertices will be positioned inside."
            },
            {
                step: 3,
                title: "Position Inner 4-Cycle",  
                description: "Place the remaining 4 vertices inside to form the second face of the cube.",
                vertices: [
                    { x: centerX - size, y: centerY - size },     // A (outer)
                    { x: centerX + size, y: centerY - size },     // B (outer)
                    { x: centerX + size, y: centerY + size },     // C (outer)
                    { x: centerX - size, y: centerY + size },     // D (outer)
                    { x: centerX - size * 0.3, y: centerY - size * 0.3 }, // E (inner)
                    { x: centerX + size * 0.3, y: centerY - size * 0.3 }, // F (inner)
                    { x: centerX + size * 0.3, y: centerY + size * 0.3 }, // G (inner)
                    { x: centerX - size * 0.3, y: centerY + size * 0.3 }  // H (inner)
                ],
                message: "Inner vertices (E,F,G,H) form a smaller square inside. Each connects to its corresponding outer vertex, creating a planar layout of the cube graph!"
            }
        ];
    }

    generateRandomGraph() {
        this.vertices = [];
        this.edges = [];
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.7;

        // Generate vertices in a more spread out pattern
        for (let i = 0; i < this.vertexCount; i++) {
            const angle = (2 * Math.PI * i) / this.vertexCount;
            const radiusVariation = radius * (0.7 + Math.random() * 0.3); // 70-100% of radius
            const angleVariation = angle + (Math.random() - 0.5) * (2 * Math.PI / this.vertexCount * 0.5);
            const x = centerX + radiusVariation * Math.cos(angleVariation);
            const y = centerY + radiusVariation * Math.sin(angleVariation);
            
            // Ensure vertices are within canvas bounds
            const margin = this.vertexRadius + 10;
            const clampedX = Math.max(margin, Math.min(canvasWidth - margin, x));
            const clampedY = Math.max(margin, Math.min(canvasHeight - margin, y));
            
            // Generate label (A-Z, then A1, B1, etc.)
            let label;
            if (i < 26) {
                label = String.fromCharCode(65 + i);
            } else {
                const letterIndex = i % 26;
                const number = Math.floor(i / 26);
                label = String.fromCharCode(65 + letterIndex) + number;
            }
            
            this.vertices.push({ x: clampedX, y: clampedY, id: i, label });
        }

        // Generate edges based on density with better distribution
        const maxEdges = (this.vertexCount * (this.vertexCount - 1)) / 2;
        const targetEdges = Math.max(this.vertexCount - 1, Math.floor(maxEdges * this.edgeDensity));
        
        // Ensure connectivity by creating a spanning tree first
        const connected = new Set([0]);
        for (let i = 1; i < this.vertexCount; i++) {
            // Connect to a random already connected vertex
            const connectTo = Array.from(connected)[Math.floor(Math.random() * connected.size)];
            this.edges.push({ v1: connectTo, v2: i });
            connected.add(i);
        }

        // Add random additional edges
        let attempts = 0;
        while (this.edges.length < targetEdges && attempts < targetEdges * 3) {
            const v1 = Math.floor(Math.random() * this.vertexCount);
            const v2 = Math.floor(Math.random() * this.vertexCount);
            
            if (v1 !== v2 && !this.hasEdge(v1, v2)) {
                this.edges.push({ v1, v2 });
            }
            attempts++;
        }

        this.solutionLayout = null;
        this.detectCrossings();
        this.draw();
    }

    hasEdge(v1, v2) {
        return this.edges.some(edge => 
            (edge.v1 === v1 && edge.v2 === v2) || 
            (edge.v1 === v2 && edge.v2 === v1)
        );
    }

    // Mouse interaction methods
    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find clicked vertex
        for (let vertex of this.vertices) {
            const dx = x - vertex.x;
            const dy = y - vertex.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.vertexRadius) {
                this.isDragging = true;
                this.dragVertex = vertex;
                this.dragOffset = { x: dx, y: dy };
                this.canvas.style.cursor = 'grabbing';
                break;
            }
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (this.isDragging && this.dragVertex) {
            // Update vertex position
            this.dragVertex.x = x - this.dragOffset.x;
            this.dragVertex.y = y - this.dragOffset.y;
            
            // Keep vertex within canvas bounds
            const margin = this.vertexRadius;
            const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
            const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
            
            this.dragVertex.x = Math.max(margin, Math.min(canvasWidth - margin, this.dragVertex.x));
            this.dragVertex.y = Math.max(margin, Math.min(canvasHeight - margin, this.dragVertex.y));
            
            // Update crossings and redraw
            this.detectCrossings();
            this.updateCrossingInfo();
            this.draw();
        } else {
            // Update cursor based on hover
            let isOverVertex = false;
            for (let vertex of this.vertices) {
                const dx = x - vertex.x;
                const dy = y - vertex.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.vertexRadius) {
                    isOverVertex = true;
                    break;
                }
            }
            this.canvas.style.cursor = isOverVertex ? 'grab' : 'default';
        }
    }

    handleMouseUp(event) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragVertex = null;
            this.canvas.style.cursor = 'default';
            
            // Check if planarity improved
            this.checkPlanarityImprovement();
        }
    }

    checkPlanarityImprovement() {
        const crossingCount = this.crossings.length;
        
        if (crossingCount === 0 && this.currentGraph) {
            this.addLearningTrace('🎉 Excellent! No edge crossings detected!', 'success');
            // Show overlay for any graph type that achieves planarity
            if (!this.isSuccessOverlayVisible()) {
                // Add a small delay to prevent rapid flickering during dragging
                setTimeout(() => {
                    if (this.crossings.length === 0) { // Double-check crossings haven't changed
                        if (this.isKnownPlanar(this.currentGraph)) {
                            this.showSuccessOverlay();
                        } else if (this.currentGraph === 'random') {
                            // For random graphs, show overlay with custom message
                            this.showSuccessOverlay();
                            setTimeout(() => {
                                const message = document.getElementById('successMessage');
                                if (message) {
                                    message.textContent = 'Great work! You found a planar layout for this random graph!';
                                }
                            }, 100);
                        }
                    }
                }, 500);
            }
        } else if (crossingCount > 0) {
            this.addLearningTrace(`${crossingCount} edge crossing${crossingCount > 1 ? 's' : ''} detected. Try repositioning vertices.`, 'warning');
            // Hide overlay if it was showing and now we have crossings
            if (this.isSuccessOverlayVisible()) {
                this.hideSuccessOverlay();
            }
        }
    }

    isKnownPlanar(graphType) {
        return ['K4', 'cube'].includes(graphType);
    }

    // Check if success overlay is currently visible
    isSuccessOverlayVisible() {
        const overlay = document.getElementById('successOverlay');
        return overlay && !overlay.classList.contains('hidden');
    }

    // Solution step management
    startSolutionMode() {
        if (!this.solutionSteps || this.solutionSteps.length === 0) return;
        
        this.isSolutionMode = true;
        this.currentSolutionStep = 0;
        this.showSolutionStep();
        this.showSolutionPanel();
    }

    showSolutionStep() {
        if (!this.solutionSteps || this.currentSolutionStep >= this.solutionSteps.length) return;
        
        const step = this.solutionSteps[this.currentSolutionStep];
        
        // Apply vertex positions for this step
        for (let i = 0; i < this.vertices.length && i < step.vertices.length; i++) {
            this.vertices[i].x = step.vertices[i].x;
            this.vertices[i].y = step.vertices[i].y;
        }
        
        this.detectCrossings();
        this.updateUI();
        this.draw();
        
        // Update solution panel
        this.updateSolutionPanel(step);
    }

    nextSolutionStep() {
        if (this.currentSolutionStep < this.solutionSteps.length - 1) {
            this.currentSolutionStep++;
            this.showSolutionStep();
        }
    }

    previousSolutionStep() {
        if (this.currentSolutionStep > 0) {
            this.currentSolutionStep--;
            this.showSolutionStep();
        }
    }

    exitSolutionMode() {
        this.isSolutionMode = false;
        this.hideSolutionPanel();
        this.addLearningTrace('Exited step-by-step solution mode', 'info');
    }

    showSolutionPanel() {
        const panel = document.getElementById('solutionPanel');
        if (panel) {
            panel.classList.remove('hidden');
        }
    }

    hideSolutionPanel() {
        const panel = document.getElementById('solutionPanel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    updateSolutionPanel(step) {
        const stepNumberEl = document.getElementById('solutionStepNumber');
        const titleEl = document.getElementById('solutionStepTitle');
        const descriptionEl = document.getElementById('solutionStepDescription');
        const messageEl = document.getElementById('solutionStepMessage');
        
        if (stepNumberEl) stepNumberEl.textContent = `Step ${step.step} of ${this.solutionSteps.length}`;
        if (titleEl) titleEl.textContent = step.title;
        if (descriptionEl) descriptionEl.textContent = step.description;
        if (messageEl) messageEl.textContent = step.message;
        
        // Update button states
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSolutionStep === 0;
            prevBtn.className = this.currentSolutionStep === 0 
                ? 'px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed'
                : 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors';
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentSolutionStep === this.solutionSteps.length - 1;
            nextBtn.className = this.currentSolutionStep === this.solutionSteps.length - 1
                ? 'px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed'
                : 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors';
        }
    }

    // Crossing detection
    detectCrossings() {
        this.crossings = [];
        
        for (let i = 0; i < this.edges.length; i++) {
            for (let j = i + 1; j < this.edges.length; j++) {
                const edge1 = this.edges[i];
                const edge2 = this.edges[j];
                
                // Skip if edges share a vertex
                if (edge1.v1 === edge2.v1 || edge1.v1 === edge2.v2 || 
                    edge1.v2 === edge2.v1 || edge1.v2 === edge2.v2) {
                    continue;
                }
                
                if (this.edgesIntersect(edge1, edge2)) {
                    this.crossings.push({ edge1: i, edge2: j });
                }
            }
        }
    }

    edgesIntersect(edge1, edge2) {
        const v1 = this.vertices[edge1.v1];
        const v2 = this.vertices[edge1.v2];
        const v3 = this.vertices[edge2.v1];
        const v4 = this.vertices[edge2.v2];
        
        return this.lineSegmentsIntersect(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y, v4.x, v4.y);
    }

    lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-10) return false; // Parallel lines
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        return t > 0 && t < 1 && u > 0 && u < 1;
    }

    // Drawing methods
    draw() {
        if (!this.ctx) return;
        
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw edges
        this.drawEdges();
        
        // Draw vertices
        this.drawVertices();
        
        // Draw crossings
        this.drawCrossings();
    }

    drawEdges() {
        for (let i = 0; i < this.edges.length; i++) {
            const edge = this.edges[i];
            const v1 = this.vertices[edge.v1];
            const v2 = this.vertices[edge.v2];
            
            // Check if this edge is involved in a crossing
            const isCrossing = this.crossings.some(c => c.edge1 === i || c.edge2 === i);
            
            // Use solution colors if in solution mode
            this.ctx.strokeStyle = isCrossing ? this.colors.crossingEdge : 
                                  (this.isSolutionMode ? this.colors.solutionEdge : this.colors.edge);
            this.ctx.lineWidth = isCrossing ? 3 : 2;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(v1.x, v1.y);
            this.ctx.lineTo(v2.x, v2.y);
            this.ctx.stroke();
        }
    }

    drawVertices() {
        for (let vertex of this.vertices) {
            // Vertex circle
            this.ctx.fillStyle = this.isDragging && this.dragVertex === vertex ? 
                                this.colors.dragVertex : 
                                (this.isSolutionMode ? this.colors.solutionVertex : this.colors.vertex);
            this.ctx.strokeStyle = this.colors.vertexBorder;
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(vertex.x, vertex.y, this.vertexRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Vertex label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(vertex.label, vertex.x, vertex.y);
        }
    }

    drawCrossings() {
        this.ctx.fillStyle = '#ff0000';
        for (let crossing of this.crossings) {
            const edge1 = this.edges[crossing.edge1];
            const edge2 = this.edges[crossing.edge2];
            
            const intersection = this.getIntersectionPoint(edge1, edge2);
            if (intersection) {
                this.ctx.beginPath();
                this.ctx.arc(intersection.x, intersection.y, 6, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }

    getIntersectionPoint(edge1, edge2) {
        const v1 = this.vertices[edge1.v1];
        const v2 = this.vertices[edge1.v2];
        const v3 = this.vertices[edge2.v1];
        const v4 = this.vertices[edge2.v2];
        
        const denom = (v1.x - v2.x) * (v3.y - v4.y) - (v1.y - v2.y) * (v3.x - v4.x);
        if (Math.abs(denom) < 1e-10) return null;
        
        const t = ((v1.x - v3.x) * (v3.y - v4.y) - (v1.y - v3.y) * (v3.x - v4.x)) / denom;
        
        return {
            x: v1.x + t * (v2.x - v1.x),
            y: v1.y + t * (v2.y - v1.y)
        };
    }

    // UI and feedback methods
    updateUI() {
        this.updateGraphInfo();
        this.updateCrossingInfo();
        this.updateButtons();
    }

    updateGraphInfo() {
        const vertexCountEl = document.getElementById('vertexCount');
        const edgeCountEl = document.getElementById('edgeCount');
        const crossingCountInfoEl = document.getElementById('crossingCountInfo');
        const planarStatusEl = document.getElementById('planarStatus');
        
        if (vertexCountEl) vertexCountEl.textContent = this.vertices.length;
        if (edgeCountEl) edgeCountEl.textContent = this.edges.length;
        if (crossingCountInfoEl) crossingCountInfoEl.textContent = this.crossings.length;
        
        if (planarStatusEl) {
            if (this.crossings.length === 0) {
                planarStatusEl.textContent = 'Planar (no crossings)';
                planarStatusEl.className = 'text-green-600 font-semibold';
            } else {
                planarStatusEl.textContent = 'Has crossings';
                planarStatusEl.className = 'text-red-600 font-semibold';
            }
        }
    }

    updateCrossingInfo() {
        const crossingInfo = document.getElementById('crossingInfo');
        const crossingCount = document.getElementById('crossingCount');
        const crossingBar = document.getElementById('crossingBar');
        
        if (this.currentGraph && crossingInfo && crossingCount && crossingBar) {
            crossingInfo.classList.remove('hidden');
            crossingCount.textContent = `${this.crossings.length} crossing${this.crossings.length !== 1 ? 's' : ''}`;
            
            // Update crossing bar (max 10 crossings for scale)
            const percentage = Math.min(this.crossings.length / 10 * 100, 100);
            crossingBar.style.width = percentage + '%';
        } else if (crossingInfo) {
            crossingInfo.classList.add('hidden');
        }
    }

    updateButtons() {
        const checkBtn = document.getElementById('checkBtn');
        const hintBtn = document.getElementById('hintBtn');
        const solutionBtn = document.getElementById('solutionBtn');
        
        if (this.currentGraph) {
            checkBtn.disabled = false;
            
            // Hide hint and solution buttons for random graphs
            if (this.currentGraph === 'random') {
                hintBtn.classList.add('hidden');
                solutionBtn.classList.add('hidden');
            } else {
                hintBtn.classList.remove('hidden');
                hintBtn.disabled = false;
                
                // Show solution button for non-random graph types
                // For planar graphs: shows step-by-step solution
                // For non-planar graphs: shows explanation of why it's non-planar
                solutionBtn.classList.remove('hidden');
                solutionBtn.disabled = false;
                
                // Update button text based on graph type
                if (this.solutionLayout) {
                    solutionBtn.textContent = 'Show Solution';
                } else {
                    solutionBtn.textContent = 'Why Non-Planar?';
                }
            }
        } else {
            checkBtn.disabled = true;
            hintBtn.classList.add('hidden');
            solutionBtn.classList.add('hidden');
        }
    }

    // Learning trace system
    addLearningTrace(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        this.learningTrace.push({ message, type, timestamp });
        this.updateLearningTraceDisplay();
    }

    updateLearningTraceDisplay() {
        const traceContent = document.getElementById('traceContent');
        if (!traceContent) return;
        
        if (this.learningTrace.length === 0) {
            traceContent.innerHTML = '<div class="text-sm text-slate-500 italic text-center py-8">Select a graph and start exploring to see learning insights here!</div>';
            return;
        }
        
        const html = this.learningTrace.map(trace => {
            const colorClass = {
                'info': 'bg-blue-50 border-blue-200 text-blue-800',
                'success': 'bg-green-50 border-green-200 text-green-800',
                'warning': 'bg-orange-50 border-orange-200 text-orange-800',
                'error': 'bg-red-50 border-red-200 text-red-800'
            }[trace.type] || 'bg-gray-50 border-gray-200 text-gray-800';
            
            return `
                <div class="p-2 rounded border ${colorClass} text-sm">
                    <div class="font-medium">${trace.message}</div>
                    <div class="text-xs opacity-70 mt-1">${trace.timestamp}</div>
                </div>
            `;
        }).reverse().join('');
        
        traceContent.innerHTML = html;
        traceContent.scrollTop = 0;
    }

    clearLearningTrace() {
        this.learningTrace = [];
        this.updateLearningTraceDisplay();
    }

    // Utility methods
    getGraphName(type) {
        const names = {
            'K4': 'Complete Graph K₄',
            'K5': 'Complete Graph K₅',
            'K33': 'Complete Bipartite K₃,₃',
            'cube': 'Cube Graph',
            'random': 'Random Graph'
        };
        return names[type] || type;
    }

    showFeedback(isSuccess, message) {
        const feedback = document.getElementById('feedback');
        if (feedback) {
            feedback.className = `mt-3 p-3 rounded ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
            feedback.textContent = message;
            feedback.classList.remove('hidden');
            
            // Auto-hide feedback after 5 seconds
            setTimeout(() => {
                if (feedback && !feedback.classList.contains('hidden')) {
                    feedback.classList.add('hidden');
                }
            }, 5000);
        }
    }

    hideFeedback() {
        const feedback = document.getElementById('feedback');
        if (feedback) {
            feedback.classList.add('hidden');
        }
    }

    showSuccessOverlay() {
        // Prevent showing overlay if already visible
        if (this.isSuccessOverlayVisible()) return;
        
        const overlay = document.getElementById('successOverlay');
        const message = document.getElementById('successMessage');
        
        if (overlay && message) {
            message.textContent = `Congratulations! You've successfully drawn ${this.getGraphName(this.currentGraph)} without edge crossings!`;
            
            // Show overlay and trigger animation
            overlay.classList.remove('hidden');
            overlay.style.opacity = '0';
            
            // Use requestAnimationFrame for smooth transition
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                const content = overlay.querySelector('div > div');
                if (content) {
                    content.style.transform = 'scale(1)';
                }
            });
        }
    }

    hideSuccessOverlay() {
        const overlay = document.getElementById('successOverlay');
        if (overlay && !overlay.classList.contains('hidden')) {
            // Animate out
            overlay.style.opacity = '0';
            const content = overlay.querySelector('div > div');
            if (content) {
                content.style.transform = 'scale(0.95)';
            }
            
            // Hide after transition
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }

    showNonPlanarExplanation() {
        const overlay = document.getElementById('nonPlanarOverlay');
        const title = document.getElementById('nonPlanarTitle');
        const explanation = document.getElementById('nonPlanarExplanation');
        const reason = document.getElementById('nonPlanarReason');
        
        if (overlay && title && explanation && reason) {
            const graphType = this.currentGraph;
            const graphName = this.getGraphName(graphType);
            
            title.textContent = `${graphName} is Non-Planar`;
            
            if (graphType === 'K5') {
                explanation.textContent = `${graphName} cannot be drawn on a plane without edge crossings.`;
                reason.innerHTML = `
                    <strong>Reasons:</strong>
                    <ul class="list-disc pl-4 mt-2 space-y-1">
                        <li>Has 5 vertices and 10 edges</li>
                        <li>Violates Euler's formula for planar graphs: E ≤ 3V - 6</li>
                        <li>For 5 vertices: max edges = 3(5) - 6 = 9, but K₅ has 10 edges</li>
                        <li>By Kuratowski's theorem, any graph containing K₅ is non-planar</li>
                    </ul>
                `;
            } else if (graphType === 'K33') {
                explanation.textContent = `${graphName} is the classic "utility graph" problem.`;
                reason.innerHTML = `
                    <strong>Reasons:</strong>
                    <ul class="list-disc pl-4 mt-2 space-y-1">
                        <li>Has 6 vertices and 9 edges in a bipartite arrangement</li>
                        <li>No faces can be triangulated (all faces need ≥4 edges)</li>
                        <li>Violates the bipartite version: E ≤ 2V - 4</li>
                        <li>Classic "3 houses, 3 utilities" problem has no solution</li>
                        <li>By Kuratowski's theorem, any graph containing K₃,₃ is non-planar</li>
                    </ul>
                `;
            } else {
                explanation.textContent = `This graph configuration cannot be drawn without crossings.`;
                reason.innerHTML = `
                    <strong>Possible reasons:</strong>
                    <ul class="list-disc pl-4 mt-2 space-y-1">
                        <li>Too many edges for the number of vertices</li>
                        <li>Contains a subdivision of K₅ or K₃,₃</li>
                        <li>Violates Euler's formula for planar graphs</li>
                    </ul>
                `;
            }
            
            overlay.classList.remove('hidden');
            overlay.style.opacity = '1';
        }
        
        this.addLearningTrace(`Viewed non-planar explanation for ${this.getGraphName(this.currentGraph)}`, 'info');
    }

    hideNonPlanarOverlay() {
        const overlay = document.getElementById('nonPlanarOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }
}

// Global functions for button actions
function checkPlanarity() {
    const viz = window.planarViz;
    if (!viz || !viz.currentGraph) return;
    
    viz.detectCrossings();
    viz.updateUI();
    
    if (viz.crossings.length === 0) {
        if (viz.isKnownPlanar(viz.currentGraph)) {
            viz.showFeedback(true, '🎉 Perfect! This graph is planar and you found a crossing-free layout!');
            viz.addLearningTrace(`Successfully drew ${viz.getGraphName(viz.currentGraph)} without crossings!`, 'success');
            // Show overlay only if not already visible
            if (!viz.isSuccessOverlayVisible()) {
                viz.showSuccessOverlay();
            }
        } else {
            // For random graphs, also show success if they achieve planarity
            viz.showFeedback(true, '✅ Excellent! No crossings detected in current layout!');
            viz.addLearningTrace('Found layout without crossings', 'success');
            if (viz.currentGraph === 'random' && !viz.isSuccessOverlayVisible()) {
                // Show overlay for random graphs too, with different message
                viz.showSuccessOverlay();
                // Update the message after showing overlay
                setTimeout(() => {
                    const message = document.getElementById('successMessage');
                    if (message) {
                        message.textContent = 'Great work! You found a planar layout for this random graph!';
                    }
                }, 100);
            }
        }
    } else {
        // Hide overlay if showing and we have crossings
        if (viz.isSuccessOverlayVisible()) {
            viz.hideSuccessOverlay();
        }
        
        const isNonPlanar = ['K5', 'K33'].includes(viz.currentGraph);
        if (isNonPlanar) {
            viz.showFeedback(false, `This graph is non-planar! ${viz.getGraphName(viz.currentGraph)} cannot be drawn without crossings.`);
            viz.addLearningTrace(`${viz.getGraphName(viz.currentGraph)} is proven non-planar`, 'info');
        } else {
            viz.showFeedback(false, `${viz.crossings.length} edge crossing(s) detected. Try repositioning vertices!`);
            viz.addLearningTrace(`${viz.crossings.length} crossings detected - keep trying!`, 'warning');
        }
    }
}

function showHint() {
    const viz = window.planarViz;
    if (!viz || !viz.currentGraph) return;
    
    const hints = {
        'K4': 'Try arranging the vertices in a square or triangle with one vertex inside.',
        'K5': 'This is one of the two fundamental non-planar graphs! No arrangement will eliminate all crossings.',
        'K33': 'This is the other fundamental non-planar graph (utility problem). No planar layout exists.',
        'cube': 'Think of unfolding a cube. Try placing vertices to form an outer cycle with inner connections.',
        'random': 'Start by arranging vertices to minimize edge crossings. Look for patterns.'
    };
    
    const hint = hints[viz.currentGraph];
    if (hint) {
        viz.showFeedback(true, `Hint: ${hint}`);
        viz.addLearningTrace(`Requested hint for ${viz.getGraphName(viz.currentGraph)}`, 'info');
    }
}

function showSolution() {
    const viz = window.planarViz;
    if (!viz || !viz.currentGraph) return;
    
    // Check if this graph has a solution
    if (!viz.solutionLayout) {
        // Show non-planar explanation overlay
        viz.showNonPlanarExplanation();
        return;
    }
    
    // Start step-by-step solution mode
    viz.startSolutionMode();
    viz.addLearningTrace(`Starting step-by-step solution for ${viz.getGraphName(viz.currentGraph)}`, 'info');
}

function nextSolutionStep() {
    const viz = window.planarViz;
    if (viz && viz.isSolutionMode) {
        viz.nextSolutionStep();
    }
}

function previousSolutionStep() {
    const viz = window.planarViz;
    if (viz && viz.isSolutionMode) {
        viz.previousSolutionStep();
    }
}

function exitSolutionMode() {
    const viz = window.planarViz;
    if (viz && viz.isSolutionMode) {
        viz.exitSolutionMode();
    }
}

function tryAnotherGraph() {
    const viz = window.planarViz;
    if (!viz) return;
    
    // Hide overlay first
    if (viz.isSuccessOverlayVisible()) {
        viz.hideSuccessOverlay();
    }
    
    // Load a random graph type (excluding current one)
    const graphTypes = ['K4', 'K5', 'K33', 'cube', 'random'];
    const availableTypes = graphTypes.filter(type => type !== viz.currentGraph);
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    // Update dropdown to reflect the new graph selection
    const graphSelect = document.getElementById('graphSelect');
    if (graphSelect) {
        graphSelect.value = randomType;
    }
    
    viz.loadGraph(randomType);
    viz.showFeedback(true, `Loaded ${viz.getGraphName(randomType)}! Try to arrange it without crossings.`);
}

function generateNewGraph() {
    const viz = window.planarViz;
    if (!viz) return;
    
    // Hide overlay if showing
    if (viz.isSuccessOverlayVisible()) {
        viz.hideSuccessOverlay();
    }
    
    // Update dropdown to reflect random graph selection
    const graphSelect = document.getElementById('graphSelect');
    if (graphSelect) {
        graphSelect.value = 'random';
    }
    
    viz.loadGraph('random');
    viz.showFeedback(true, 'Generated new random graph! Try to arrange it without crossings.');
}

function resetGraph() {
    const viz = window.planarViz;
    if (!viz || !viz.currentGraph) return;
    
    // Hide overlay if showing
    if (viz.isSuccessOverlayVisible()) {
        viz.hideSuccessOverlay();
    }
    
    viz.loadGraph(viz.currentGraph);
    viz.showFeedback(true, 'Graph positions reset to original layout.');
    viz.addLearningTrace('Reset graph to original positions', 'info');
}

function updateVertexCount() {
    const viz = window.planarViz;
    if (!viz) return;
    
    const slider = document.getElementById('vertexCountSlider');
    const value = document.getElementById('vertexCountValue');
    
    if (slider && value) {
        viz.vertexCount = parseInt(slider.value);
        value.textContent = viz.vertexCount;
        
        if (viz.currentGraph === 'random') {
            viz.generateRandomGraph();
        }
    }
}

function updateEdgeDensity() {
    const viz = window.planarViz;
    if (!viz) return;
    
    const slider = document.getElementById('edgeDensitySlider');
    const value = document.getElementById('edgeDensityValue');
    
    if (slider && value) {
        viz.edgeDensity = parseFloat(slider.value);
        value.textContent = viz.edgeDensity.toFixed(1);
        
        if (viz.currentGraph === 'random') {
            viz.generateRandomGraph();
        }
    }
}

function clearLearningTrace() {
    const viz = window.planarViz;
    if (!viz) return;
    viz.clearLearningTrace();
}

function hideSuccessOverlay() {
    const viz = window.planarViz;
    if (viz) {
        viz.hideSuccessOverlay();
    }
}

function hideNonPlanarOverlay() {
    const viz = window.planarViz;
    if (viz) {
        viz.hideNonPlanarOverlay();
    }
}

// Initialize visualization when page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.planarViz = new PlanarGraphVisualization();
        if (!window.planarViz.canvas || !window.planarViz.ctx) {
            console.error('Failed to initialize PlanarGraphVisualization');
        }
    } catch (error) {
        console.error('Error initializing PlanarGraphVisualization:', error);
    }
});
