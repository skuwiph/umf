import Foundation

class MetaForm {
    var name: String
    var title: String
    var version = 1
    var dateModified = Date()
    var dataSource: String?
    var drawType = MetaFormDrawType.SingleQuestion
    var allowSaves: Bool = false
    var sections: [MFSection] = []
    var questions: [MFQuestion] = []
    var data = MetaFormData()
    
    init(name: String, title: String) {
        self.name = name
        self.title = title
    }
    
    // Initialise the form ready for first use/display
    func initialise() {
        // Find all field references and dependencies
        for q in self.questions {
            for c in q.controls {
                // a reference is required when a validator
                // from one control checks against another
                // control
                if !c.references.isEmpty {
                    for name in c.references {
                        self.addReference(from: c.name, to: name)
                    }
                }
                
                // A dependency is where data has to come
                // from another control
                if c.dependencies != nil && !c.dependencies!.isEmpty {
                    for dependent in c.dependencies! {
                        self.addReference(from: c.name, to: dependent)
                    }
                }
                
                self.determineQuestionDisplay(question: q, dependencies: c.dependencies)
            }
        }
    }
    
    func determineQuestionDisplay(question: MFQuestion, dependencies: [String]?) {
        if dependencies == nil {
            return
        }
        
        question.canBeDisplayed = {
            for c in question.controls {
                if c.dependencies != nil {
                    for d in c.dependencies! {
                        return self.getValue(d).isEmpty
                    }
                }
            }
            
            return true
        }
    }
    
    func getValue(_ name: String) -> String {
        return self.data.getValue(name)
    }
    
    func setValue(_ name: String, value: String) {
        self.data.setValue(name, value: value)
    }
    
    func addQuestion(name: String, caption: String) -> MFQuestion {
        let q = MFQuestion(sectionId: 1, name: name, caption: caption)
        self.questions.append(q)
        
        return q;
    }
    
    func getQuestion(name: String) -> MFQuestion? {
        if let q = self.questions.first(where: { $0.name == name}) {
            return q
        }
        
        return nil
    }
    
    private func addReference(from: String, to: String) {
        if let toControl = self.getControlBy(name: to) {
            toControl.addReferencedBy(controlName: from)
        }
    }
    
    private func getControlBy(name: String) -> MFControl? {
        for q in self.questions {
            for c in q.controls {
                if c.name == name {
                    return c
                }
            }
        }
        return nil
    }
    
    static func isFieldReference(value: String) -> (isField: Bool, fieldName: String?) {
        if value.contains("[") {
            return ( isField: true, fieldName: getFieldName(from: value))
        }
        return (isField: false, fieldName: nil)
    }
    
    static func isVariableReference(value: String) -> (isVariable: Bool, variableName: String?) {
        if value.contains("%") {
            return ( isVariable: true, variableName: getVariable(from: value))
        }
        return (isVariable: false, variableName: nil)
    }
    
    static func getFieldName(from: String) -> String {
        let start = from.index(from.startIndex, offsetBy: 1)
        let end = from.index(from.endIndex, offsetBy: -1)
        let range = start..<end
        return String(from[range])
    }
    
    static func getVariable(from: String) -> String {
        let start = from.index(from.startIndex, offsetBy: 1)
        let range = start..<from.endIndex
        return String(from[range])
    }
}

struct MFSection {
    var id: UInt8
    var title: String
    var ruleToMatch: String?
}

class MFQuestion {
    var sectionId: UInt8
    var name: String
    var caption: String?
    var captionFootnote: String?
    var ruleToMatch: String?
    var controlLayout: ControlLayoutStyle = ControlLayoutStyle.Vertical
    var controls: [MFControl] = []
    var readonly = false
    var available = true
    var canBeDisplayed: () -> Bool = {return true}
    
    init(sectionId: UInt8, name: String, caption: String?) {
        self.sectionId = sectionId
        self.name = name
        self.caption = caption
    }
    
    func addDateControl(name: String, dateType: MetaFormDateType) -> MFDateControl {
        let c = MFDateControl(parent: self, name: name, dateType: dateType)
        self.pushControl(control: c)
        
        return c;
    }
    
    func addTimeControl(name: String, minuteStep: UInt8?, hourStart: UInt8?, hourEnd: UInt8?) -> MFTimeControl {
        let c = MFTimeControl(parent: self, name: name, minuteStep: 15, hourStart: 8, hourEnd: 20)
        
        self.pushControl(control: c)
        
        return c;
    }
    
    private func pushControl(control: MFControl) {
        
        self.controls.append(control)
    }
}

struct MFAnimation {
    var event: String
    var name: String
}

