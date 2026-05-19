pipeline {
  agent any

  environment {
    APP_NAME = 'taskapi'
    RELEASE  = "v1.0.${BUILD_NUMBER}"
    STAGING_PORT = '3001'
    PROD_PORT    = '3000'
  }

  options {
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
  }

  stages {

    stage('Build') {
      steps {
        sh 'npm ci'
        sh 'npm run build'
        echo "Build ${BUILD_NUMBER} complete"
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'junit.xml'
        }
      }
    }

    stage('Code Quality') {
      steps {
        withSonarQubeEnv('SonarQube') {
          sh '''
            sonar-scanner \
              -Dsonar.projectKey=taskapi \
              -Dsonar.sources=src \
              -Dsonar.tests=tests \
              -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
          '''
        }

        timeout(time: 3, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: false
        }
      }
    }

    stage('Security Scan') {
      steps {
        sh '''
          npm audit --audit-level=high --json > npm-audit.json || true
          npm audit --audit-level=high || true
        '''

        sh '''
          trivy fs . \
            --severity HIGH,CRITICAL \
            --exit-code 0 \
            --format table \
            --output trivy-report.txt || true
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'trivy-report.txt,npm-audit.json',
                           allowEmptyArchive: true
        }
      }
    }

    stage('Deploy to Staging') {
      steps {
        script {
          sh 'pm2 delete taskapi-staging || true'

          sh """
            PORT=${env.STAGING_PORT} \
            pm2 start src/index.js \
              --name taskapi-staging \
              --env production
          """

          sleep 5

          sh """
            curl -sf http://localhost:${env.STAGING_PORT}/health \
              && echo "Staging is healthy" \
              || (echo "Staging failed" && exit 1)
          """
        }
      }
    }

    stage('Release') {
      steps {
        script {
          withCredentials([usernamePassword(
            credentialsId: 'github-credentials',
            usernameVariable: 'GIT_USER',
            passwordVariable: 'GIT_TOKEN'
          )]) {

            sh """
              git config user.email "jenkins@local"
              git config user.name "Jenkins"

              git tag -a ${env.RELEASE} \
                -m "Release ${env.RELEASE} build ${env.BUILD_NUMBER}"

              git push \
                https://${GIT_USER}:${GIT_TOKEN}@github.com/SIDHANT036/taskapi.git \
                ${env.RELEASE}
            """
          }

          sh 'pm2 delete taskapi-prod || true'

          sh """
            PORT=${env.PROD_PORT} \
            pm2 start src/index.js \
              --name taskapi-prod \
              --env production
          """

          sh 'pm2 save'
        }
      }
    }

    stage('Monitoring') {
      steps {
        script {
          sh """
            curl -sf http://localhost:${env.STAGING_PORT}/health \
              && echo "Staging OK"
          """

          sh """
            curl -sf http://localhost:${env.PROD_PORT}/health \
              && echo "Production OK"
          """

          sh 'pm2 list'
          sh 'pm2 logs --nostream --lines 50 > pm2-logs.txt || true'
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'pm2-logs.txt',
                           allowEmptyArchive: true
        }
      }
    }
  }

  post {
    success {
      echo "Pipeline SUCCESS: ${env.RELEASE}"
    }
    failure {
      echo "Pipeline FAILED on build ${BUILD_NUMBER}"
    }
  }
}