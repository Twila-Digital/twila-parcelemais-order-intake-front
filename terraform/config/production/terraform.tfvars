# TODO(infra): revisar todos os valores deste arquivo. Domínio, API e serviço
# do Datadog são placeholders inferidos dos outros fronts do Credicarro.
environment                                 = "production"
region                                      = "us-east-1"
name                                        = "twila-credicarro-proposal-intake-front"
github_personal_access_token_secret_path    = "/amplify-app-github-token"
description                                 = "Credicarro Proposal Intake FrontEnd"
repository                                  = "https://github.com/Twila-Digital/twila-credicarro-proposal-intake-front"
iam_service_role_enabled                    = true
platform                                    = "WEB_COMPUTE"

environment_variables                       = {
  _CUSTOM_IMAGE = "amplify:al2023",
  _LIVE_UPDATES = "[{\"name\":\"Node.js version\",\"pkg\":\"node\",\"type\":\"nvm\",\"version\":\"20.18.3\"}]",
  API_URL = "https://api.credicarro.com.br",
  NEXT_PUBLIC_ENVIRONMENT = "production",
  NEXT_PUBLIC_IN_MAINTENANCE = "false",
  NEXT_PUBLIC_DATADOG_CLIENT_SERVICE = "credicarro-proposal-intake-production",
  NEXT_PUBLIC_WEBSOCKET_URL = "https://api.credicarro.com.br",
  NEXT_PUBLIC_CREDICARRO_URL = "https://www.credicarro.com.br",
}

environments                                = {
  production = {
    branch_name               = "production",
    environment_name          = "production",
    framework                 = "Next.js - SSR",
    enable_auto_build         = false,
    enable_performance_mode   = false,
    ttl                       = 30,
    stage                     = "DEVELOPMENT",
    webhook_enabled           = true
  }
}

custom_rules = [
  {
    source    = "https://proposta.credicarro.com.br"
    target    = "https://www.proposta.credicarro.com.br"
    status    = "301"
    condition = null
  },
  {
    source    = "https://proposta.credicarro.com.br/*"
    target    = "https://www.proposta.credicarro.com.br/*"
    status    = "301"
    condition = null
  }
]

root_domain              = "credicarro.com.br"
network_account_role_arn = "arn:aws:iam::747862477765:role/production-network-route53-credicarro-production"

domains = {
  "proposta.credicarro.com.br" = {
    sub_domain = [
      { branch_name = "production", prefix = "" },
      { branch_name = "production", prefix = "www" },
    ]
  }
}
