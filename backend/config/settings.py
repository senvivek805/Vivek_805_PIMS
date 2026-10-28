"""
Django settings for config project.
"""

from pathlib import Path
from decouple import config
from django.templatetags.static import static
from django.urls import reverse_lazy

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')


# ============================================
# APPLICATIONS
# ============================================

INSTALLED_APPS = [
    # Unfold MUST be before django.contrib.admin
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.forms",
    "unfold.contrib.inlines",

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'corsheaders',

    # Local apps
    'core',
    'accounts',
    'projects',
    'funds',
    'vendors',
    'employees',
    'purchase',
    'materials',
    'bills',
    'service_completion',
    'documents',
    'audit_logs',
]

# ============================================
# MIDDLEWARE
# ============================================

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'audit_logs.middleware.CurrentUserMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'


# ============================================
# TEMPLATES
# ============================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'core' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# ============================================
# CUSTOM USER MODEL
# ============================================

AUTH_USER_MODEL = 'accounts.User'


# ============================================
# DATABASE — PostgreSQL
# ============================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}


# ============================================
# PASSWORD VALIDATION
# ============================================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ============================================
# INTERNATIONALIZATION
# ============================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True


# ============================================
# STATIC & MEDIA
# ============================================

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'


# ============================================
# DEFAULT PRIMARY KEY
# ============================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ============================================
# CORS & SESSION (FRONTEND KE LIYE)
# ============================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# CSRF Trusted Origins (session cookie ke liye zaroori)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Session Cookie Settings
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_AGE = 86400 * 7  # 7 days

# CSRF Cookie Settings
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SECURE = False


# ============================================
# REST FRAMEWORK
# ============================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'core.permissions.PIMSRolePermission',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}


# ============================================
# EMAIL (Console — Local Dev)
# ============================================

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'


# ============================================
# UNFOLD ADMIN THEME
# ============================================

UNFOLD = {
    "SITE_TITLE": "PIMS Admin",
    "SITE_HEADER": "IIT(BHU) PIMS",
    "SITE_SUBHEADER": "Project Information Management System",
    "SITE_URL": "/",
    "SITE_ICON": lambda request: static("img/iitbhu-emblem.png"),
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "COLORS": {
        "primary": {
            "50": "239 246 255",
            "100": "219 234 254",
            "200": "191 219 254",
            "300": "147 197 253",
            "400": "96 165 250",
            "500": "59 130 246",
            "600": "37 99 235",
            "700": "29 78 216",
            "800": "30 64 175",
            "900": "30 58 138",
            "950": "23 37 84",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": "Master Data",
                "separator": True,
                "items": [
                    {
                        "title": "Projects",
                        "icon": "folder",
                        "link": reverse_lazy("admin:projects_project_changelist"),
                    },
                    {
                        "title": "Vendors",
                        "icon": "store",
                        "link": reverse_lazy("admin:vendors_vendor_changelist"),
                    },
                    {
                        "title": "Employees",
                        "icon": "badge",
                        "link": reverse_lazy("admin:employees_employee_changelist"),
                    },
                ],
            },
            {
                "title": "Funds & Budget",
                "separator": True,
                "items": [
                    {
                        "title": "Fund Receipts",
                        "icon": "account_balance_wallet",
                        "link": reverse_lazy("admin:funds_fundreceipt_changelist"),
                    },
                    {
                        "title": "Budget Breakups",
                        "icon": "pie_chart",
                        "link": reverse_lazy("admin:funds_fundbreakup_changelist"),
                    },
                ],
            },
            {
                "title": "Transactions",
                "separator": True,
                "items": [
                    {
                        "title": "Purchase Orders",
                        "icon": "shopping_cart",
                        "link": reverse_lazy("admin:purchase_purchaseorder_changelist"),
                    },
                    {
                        "title": "Bills (Form 5)",
                        "icon": "receipt_long",
                        "link": reverse_lazy("admin:bills_billentry_changelist"),
                    },
                    {
                        "title": "Material Receipts",
                        "icon": "inventory",
                        "link": reverse_lazy("admin:materials_materialreceipt_changelist"),
                    },
                ],
            },
        ],
    },
}