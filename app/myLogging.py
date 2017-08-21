import logging

logging.basicConfig()

# Default logging configuration: INFO for document and timeline (useful to app developers), WARNING for everything else.
#DEFAULT_LOG_CONFIG="document:INFO,WARNING"
DEFAULT_LOG_CONFIG="INFO"

class MyFormatter(logging.Formatter):

    def format(self, record):
        contextID = None
        dmappID = None
        if hasattr(record, 'contextID'):
            contextID = record.contextID
        source = "AuthoringService"
        level = record.levelname
        subSource = record.module
        message = logging.Formatter.format(self, record)
        logmessage = repr('"' + message)
        if logmessage[0] == 'u':
            logmessage = logmessage[1:]
        logmessage = "'" + logmessage[2:]
        
        rvList = ['2-Immerse']
        if source:
            rvList.append('source:%s' % source)
        if subSource:
            rvList.append('subSource:%s' % subSource)
        if level:
            rvList.append('level:%s' % level)
        if contextID:
            rvList.append('contextID:%s' % contextID)
        if documentID:
            rvList.append('documentID:%s' % dmappID)
        if hasattr(record, 'xpath'):
            rvList.append('xpath:%s ' % repr(record.xpath))
        if hasattr(record, 'dmappcID'):
            rvList.append('dmappcID:%s ' % record.dmappcID)
        rvList.append('sourcetime:%s' % datetime.datetime.fromtimestamp(time.time()).isoformat())
        rvList.append('logmessage:%s' % logmessage)
        return ' '.join(rvList)
        
class MyLoggerAdapter(logging.LoggerAdapter):

	def process(self, msg, kwargs):
		if 'extra' in kwargs:
			kwargs['extra'].update(self.extra)
		else:
			kwargs['extra'] = self.extra
		return msg, kwargs

def install(noKibana=False, logLevel=DEFAULT_LOG_CONFIG):
    if noKibana:
        global MyFormatter
        MyFormatter = logging.Formatter
    if logLevel:
        for ll in args.logLevel.split(','):
            if ':' in ll:
                loggerToModify = logging.getLogger(ll.split(':')[0])
                newLevel = getattr(logging, ll.split(':')[1])
            else:
                loggerToModify = logging.getLogger()
                newLevel = getattr(logging, ll)
            loggerToModify.setLevel(newLevel)
    
    rootLogger = logging.getLogger()
    rootLogger.handlers[0].setFormatter(MyFormatter())

