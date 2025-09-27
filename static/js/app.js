// Modern Manga Collection JavaScript
class MangaApp {
    constructor() {
        this.currentPage = 1;
        this.perPage = 20;
        this.currentSearch = '';
        this.currentCategory = 'all';
        this.currentSort = 'last_read';
        this.currentView = 'grid';
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadManga();
        this.setupViewToggle();
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value;
                    this.currentPage = 1;
                    this.loadManga();
                }, 300);
            });
        }
        
        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.currentPage = 1;
                this.loadManga();
            });
        }
        
        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.currentPage = 1;
                this.loadManga();
            });
        }
        
        // Modal close on outside click
        const modal = document.getElementById('mangaModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }
    
    setupViewToggle() {
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');
        const mangaGrid = document.getElementById('mangaGrid');
        
        if (gridViewBtn && listViewBtn && mangaGrid) {
            gridViewBtn.addEventListener('click', () => {
                this.currentView = 'grid';
                gridViewBtn.classList.add('active');
                listViewBtn.classList.remove('active');
                mangaGrid.classList.remove('list-view');
                localStorage.setItem('mangaView', 'grid');
            });
            
            listViewBtn.addEventListener('click', () => {
                this.currentView = 'list';
                listViewBtn.classList.add('active');
                gridViewBtn.classList.remove('active');
                mangaGrid.classList.add('list-view');
                localStorage.setItem('mangaView', 'list');
            });
            
            // Load saved view preference
            const savedView = localStorage.getItem('mangaView');
            if (savedView === 'list') {
                listViewBtn.click();
            }
        }
    }
    
    async loadManga() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            const params = new URLSearchParams({
                search: this.currentSearch,
                category: this.currentCategory,
                sort: this.currentSort,
                page: this.currentPage,
                per_page: this.perPage
            });
            
            const response = await fetch(`/api/manga?${params}`);
            const data = await response.json();
            
            this.renderManga(data.manga);
            this.renderPagination(data);
            this.updateResultCount(data);
            
        } catch (error) {
            console.error('Error loading manga:', error);
            this.showError('Failed to load manga data. Please try again.');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }
    
    renderManga(mangaList) {
        const mangaGrid = document.getElementById('mangaGrid');
        if (!mangaGrid) return;
        
        if (mangaList.length === 0) {
            mangaGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-content">
                        <i class="fas fa-search fa-3x"></i>
                        <h3>No manga found</h3>
                        <p>Try adjusting your search or filter criteria.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        mangaGrid.innerHTML = mangaList.map(manga => this.createMangaCard(manga)).join('');
        
        // Add click listeners to manga cards
        mangaGrid.querySelectorAll('.manga-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showMangaDetails(mangaList[index]);
            });
        });
        
        // Animate cards
        mangaGrid.querySelectorAll('.manga-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.add('fade-in');
        });
    }
    
    createMangaCard(manga) {
        const synonymsHtml = manga.synonyms.length > 0 ? `
            <div class="manga-synonyms">
                <div class="synonyms-list">
                    ${manga.synonyms.slice(0, 3).map(synonym => 
                        `<span class="synonym-tag">${this.escapeHtml(synonym)}</span>`
                    ).join('')}
                    ${manga.synonyms.length > 3 ? `<span class="synonym-tag">+${manga.synonyms.length - 3} more</span>` : ''}
                </div>
            </div>
        ` : '';
        
        const linksHtml = `
            <div class="manga-links">
                ${this.createExternalLink('mal', manga.external_links.mal, 'MyAnimeList')}
                ${this.createExternalLink('anilist', manga.external_links.anilist, 'AniList')}
                ${this.createExternalLink('mangaupdates', manga.external_links.mangaupdates, 'MangaUpdates')}
            </div>
        `;
        
        return `
            <div class="manga-card" data-manga-id="${manga.id}">
                <div class="manga-header">
                    <h3 class="manga-title">${this.escapeHtml(manga.title)}</h3>
                    <span class="manga-category">${manga.reading_category}</span>
                </div>
                
                <div class="manga-info">
                    <div class="chapters-read">
                        <i class="fas fa-book-open"></i>
                        <span>${manga.chapters_read} chapters</span>
                    </div>
                    <div class="last-read">
                        <i class="fas fa-clock"></i>
                        <span>${manga.last_read}</span>
                    </div>
                </div>
                
                ${synonymsHtml}
                ${linksHtml}
            </div>
        `;
    }
    
    createExternalLink(type, url, title) {
        const icons = {
            mal: 'fas fa-star',
            anilist: 'fas fa-heart',
            mangaupdates: 'fas fa-database'
        };
        
        if (url) {
            return `
                <a href="${url}" target="_blank" rel="noopener noreferrer" 
                   class="external-link ${type}" title="${title}"
                   onclick="event.stopPropagation()">
                    <i class="${icons[type]}"></i>
                </a>
            `;
        } else {
            return `
                <span class="external-link ${type} disabled" title="Not available">
                    <i class="${icons[type]}"></i>
                </span>
            `;
        }
    }
    
    renderPagination(data) {
        const pagination = document.getElementById('pagination');
        if (!pagination || data.total_pages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        const currentPage = data.page;
        const totalPages = data.total_pages;
        
        let paginationHtml = '';
        
        // Previous button
        paginationHtml += `
            <button ${currentPage <= 1 ? 'disabled' : ''} 
                    onclick="mangaApp.goToPage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `<button onclick="mangaApp.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHtml += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <button ${i === currentPage ? 'class="active"' : ''} 
                        onclick="mangaApp.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHtml += `<button onclick="mangaApp.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        paginationHtml += `
            <button ${currentPage >= totalPages ? 'disabled' : ''} 
                    onclick="mangaApp.goToPage(${currentPage + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHtml;
    }
    
    updateResultCount(data) {
        const resultCount = document.getElementById('resultCount');
        if (resultCount) {
            const start = (data.page - 1) * data.per_page + 1;
            const end = Math.min(data.page * data.per_page, data.total);
            resultCount.textContent = `Showing ${start}-${end} of ${data.total} manga`;
        }
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.loadManga();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    showMangaDetails(manga) {
        const modal = document.getElementById('mangaModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = manga.title;
        
        const synonymsHtml = manga.synonyms.length > 0 ? `
            <div class="modal-section">
                <h4><i class="fas fa-tags"></i> Alternative Titles</h4>
                <div class="synonyms-grid">
                    ${manga.synonyms.map(synonym => 
                        `<span class="synonym-tag">${this.escapeHtml(synonym)}</span>`
                    ).join('')}
                </div>
            </div>
        ` : '';
        
        const linksHtml = `
            <div class="modal-section">
                <h4><i class="fas fa-external-link-alt"></i> External Links</h4>
                <div class="external-links-grid">
                    ${manga.external_links.mal ? 
                        `<a href="${manga.external_links.mal}" target="_blank" class="modal-link mal">
                            <i class="fas fa-star"></i> MyAnimeList
                        </a>` : 
                        `<span class="modal-link disabled"><i class="fas fa-star"></i> MyAnimeList</span>`
                    }
                    ${manga.external_links.anilist ? 
                        `<a href="${manga.external_links.anilist}" target="_blank" class="modal-link anilist">
                            <i class="fas fa-heart"></i> AniList
                        </a>` : 
                        `<span class="modal-link disabled"><i class="fas fa-heart"></i> AniList</span>`
                    }
                    ${manga.external_links.mangaupdates ? 
                        `<a href="${manga.external_links.mangaupdates}" target="_blank" class="modal-link mangaupdates">
                            <i class="fas fa-database"></i> MangaUpdates
                        </a>` : 
                        `<span class="modal-link disabled"><i class="fas fa-database"></i> MangaUpdates</span>`
                    }
                </div>
            </div>
        `;
        
        modalBody.innerHTML = `
            <div class="modal-manga-info">
                <div class="modal-stats">
                    <div class="modal-stat">
                        <i class="fas fa-book-open"></i>
                        <div>
                            <span class="stat-value">${manga.chapters_read}</span>
                            <span class="stat-label">Chapters Read</span>
                        </div>
                    </div>
                    <div class="modal-stat">
                        <i class="fas fa-clock"></i>
                        <div>
                            <span class="stat-value">${manga.last_read}</span>
                            <span class="stat-label">Last Read</span>
                        </div>
                    </div>
                    <div class="modal-stat">
                        <i class="fas fa-tag"></i>
                        <div>
                            <span class="stat-value">${manga.reading_category}</span>
                            <span class="stat-label">Category</span>
                        </div>
                    </div>
                    ${manga.rating ? `
                        <div class="modal-stat">
                            <i class="fas fa-star"></i>
                            <div>
                                <span class="stat-value">${manga.rating}</span>
                                <span class="stat-label">Rating</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                ${synonymsHtml}
                ${linksHtml}
            </div>
        `;
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        const modal = document.getElementById('mangaModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.toggle('show', show);
        }
    }
    
    showError(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for HTML onclick handlers
function closeModal() {
    if (window.mangaApp) {
        window.mangaApp.closeModal();
    }
}

function showAbout() {
    alert('Manga Collection Web App\n\nA modern, responsive interface for viewing your manga reading bookmarks.\n\nFeatures:\nâ€¢ Search and filter manga\nâ€¢ Multiple view modes\nâ€¢ External links integration\nâ€¢ Responsive design\nâ€¢ Dark mode support');
}

function exportData() {
    // Create a simple export functionality
    const link = document.createElement('a');
    link.href = '/api/manga?per_page=1000';
    link.download = 'manga_collection.json';
    link.click();
}

// Additional CSS for modal content and toast notifications
const additionalStyles = `
<style>
.modal-section {
    margin-bottom: 1.5rem;
}

.modal-section h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
}

.modal-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.modal-stat {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}

.modal-stat i {
    font-size: 1.25rem;
    color: var(--primary-color);
}

.stat-value {
    display: block;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
}

.stat-label {
    display: block;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.synonyms-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.external-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.modal-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    border: 2px solid var(--border-color);
}

.modal-link.mal {
    background: #2e51a2;
    color: var(--text-light);
    border-color: #2e51a2;
}

.modal-link.anilist {
    background: #02a9ff;
    color: var(--text-light);
    border-color: #02a9ff;
}

.modal-link.mangaupdates {
    background: #6c5ce7;
    color: var(--text-light);
    border-color: #6c5ce7;
}

.modal-link.disabled {
    background: var(--bg-tertiary);
    color: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.6;
}

.modal-link:not(.disabled):hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.no-results {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
}

.no-results-content {
    text-align: center;
    color: var(--text-muted);
}

.no-results-content i {
    margin-bottom: 1rem;
    opacity: 0.5;
}

.no-results-content h3 {
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
}

.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--danger-color);
    color: var(--text-light);
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    z-index: 1001;
}

.toast.show {
    transform: translateX(0);
}

.pagination-ellipsis {
    padding: 0.75rem 1rem;
    color: var(--text-muted);
}

@media (max-width: 768px) {
    .modal-stats {
        grid-template-columns: 1fr;
    }
    
    .external-links-grid {
        grid-template-columns: 1fr;
    }
    
    .toast {
        right: 10px;
        left: 10px;
        transform: translateY(-100%);
    }
    
    .toast.show {
        transform: translateY(0);
    }
}
</style>
`;

// Add additional styles to head
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mangaApp = new MangaApp();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/js/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
